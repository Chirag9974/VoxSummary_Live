const API_BASE_URL = "http://localhost:3000";
const WEB_BASE_URL = "http://localhost:5173";

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");
const meetingTitleEl = document.getElementById("meetingTitle");
const summaryTitleEl = document.getElementById("summaryTitle");
const summaryPointsEl = document.getElementById("summaryPoints");
const summaryActionsEl = document.getElementById("summaryActions");
const transcriptEl = document.getElementById("transcript");
const uploadInput = document.getElementById("uploadInput");
const uploadBtn = document.getElementById("uploadBtn");
const downloadTranscriptBtn = document.getElementById("downloadTranscriptBtn");
const downloadSummaryBtn = document.getElementById("downloadSummaryBtn");
const uploadStatus = document.getElementById("uploadStatus");

let mediaRecorder = null;
let sessionId = null;
let isRecording = false;
let lastNoteId = null;
let lastSummaryTitle = null;
let lastOriginalName = null;
let audioContext = null;
let analyser = null;
let animationFrameId = null;
let mediaStreamSource = null;

const canvas = document.getElementById("waveform");
const canvasCtx = canvas.getContext("2d");

const setStatus = (text) => {
  statusEl.textContent = text;
};

const setUploadStatus = (text) => {
  uploadStatus.textContent = text;
};

const enableDownloadButtons = (enabled) => {
  downloadTranscriptBtn.disabled = !enabled;
  downloadSummaryBtn.disabled = !enabled;
};

const renderSummary = (summary) => {
  if (!summary) {
    summaryTitleEl.textContent = "Waiting for audio...";
    summaryPointsEl.innerHTML = "";
    summaryActionsEl.innerHTML = "";
    return;
  }

  summaryTitleEl.textContent = summary.title || "Summary";
  summaryPointsEl.innerHTML = "";
  (summary.keyPoints || []).forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    summaryPointsEl.appendChild(li);
  });

  summaryActionsEl.innerHTML = "";
  (summary.actionItems || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.task || "Action item";
    summaryActionsEl.appendChild(li);
  });
};

const updateTranscript = (text) => {
  transcriptEl.textContent = text || "No transcript yet.";
};

const drawWaveform = () => {
  if (!analyser) return;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = "#f8fafc";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "#6366f1";
  canvasCtx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i += 1) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();

  animationFrameId = requestAnimationFrame(drawWaveform);
};

const stopWaveform = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
};

const startSession = async () => {
  const title = meetingTitleEl.value.trim() || "live-meeting";
  const response = await fetch(`${API_BASE_URL}/api/voice/live/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Unable to start session");
  }

  sessionId = payload?.data?.sessionId || null;
  if (!sessionId) {
    throw new Error("Live session not initialized");
  }
  return sessionId;
};

const sendChunk = async (blob) => {
  if (!sessionId) {
    throw new Error("Live session not initialized");
  }

  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("audio", blob, "chunk.webm");

  const response = await fetch(`${API_BASE_URL}/api/voice/live/chunk`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Failed to send chunk");
  }

  if (payload.data) {
    updateTranscript(payload.data.transcription);
    renderSummary(payload.data.summary);
  }
};

const stopSession = async () => {
  if (!sessionId) return;

  const response = await fetch(`${API_BASE_URL}/api/voice/live/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Failed to stop session");
  }

  sessionId = null;
  return payload.data;
};

startBtn.addEventListener("click", async () => {
  if (isRecording) return;

  try {
    setStatus("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  sessionId = await startSession();
  setStatus("Session started. Recording...");

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  mediaStreamSource = audioContext.createMediaStreamSource(stream);
  mediaStreamSource.connect(analyser);
  drawWaveform();

    const preferredMime = "audio/webm;codecs=opus";
    const mimeType = MediaRecorder.isTypeSupported(preferredMime)
      ? preferredMime
      : "audio/webm";
    mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 64000
    });
    mediaRecorder.addEventListener("dataavailable", async (event) => {
      if (event.data && event.data.size > 0) {
        try {
          await sendChunk(event.data);
          setStatus("Live transcription running...");
        } catch (error) {
          setStatus(error.message);
          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }
      }
    });

    mediaRecorder.addEventListener("stop", async () => {
      stream.getTracks().forEach((track) => track.stop());
      stopWaveform();
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      try {
        setStatus("Finalizing...");
        const result = await stopSession();
        updateTranscript(result?.transcription || "No transcript generated.");
        renderSummary(result?.summary || null);
        lastNoteId = result?._id || null;
        lastSummaryTitle = result?.summary?.title || null;
        lastOriginalName = result?.originalName || null;
        enableDownloadButtons(!!lastNoteId);
        if (lastNoteId) {
          setUploadStatus("Live session saved. You can download now.");
        }
        setStatus("Session saved.");
      } catch (error) {
        setStatus(error.message);
      }
    });

    mediaRecorder.start(4000);
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    setStatus("Recording live audio...");
  } catch (error) {
    sessionId = null;
    setStatus(error.message || "Unable to start recording");
  }
});

stopBtn.addEventListener("click", () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;
  mediaRecorder.stop();
  isRecording = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

const handleUpload = async () => {
  const file = uploadInput.files?.[0];
  if (!file) {
    setUploadStatus("Please select an audio file.");
    return;
  }

  try {
    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("audio", file);

    const response = await fetch(`${API_BASE_URL}/api/voice`, {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || "Upload failed");
    }

  lastNoteId = payload.data?._id || null;
  lastSummaryTitle = payload.data?.summary?.title || null;
  lastOriginalName = payload.data?.originalName || payload.data?.audioPath || null;
  enableDownloadButtons(!!lastNoteId);
    setUploadStatus("Upload complete. You can download now.");
    updateTranscript(payload.data?.transcription || "No transcript generated.");
    renderSummary(payload.data?.summary || null);
  } catch (error) {
    setUploadStatus(error.message || "Upload failed.");
  }
};

uploadBtn.addEventListener("click", handleUpload);

downloadTranscriptBtn.addEventListener("click", () => {
  if (!lastNoteId) {
    setUploadStatus("Upload a file first.");
    return;
  }
  const baseName = lastOriginalName
    ? lastOriginalName.replace(/\.[^/.]+$/, "")
    : "meeting";
  const filename = `${baseName}.txt`;
  window.open(
    `${API_BASE_URL}/api/voice/notes/${lastNoteId}/download?type=transcript&filename=${encodeURIComponent(
      filename
    )}`,
    "_blank"
  );
});

downloadSummaryBtn.addEventListener("click", () => {
  if (!lastNoteId) {
    setUploadStatus("Upload a file first.");
    return;
  }
  const title = lastSummaryTitle || "meeting-summary";
  const filename = `${title.replace(/[^a-z0-9_.-]+/gi, "_")}.summary.txt`;
  window.open(
    `${API_BASE_URL}/api/voice/notes/${lastNoteId}/download?type=summary&filename=${encodeURIComponent(
      filename
    )}`,
    "_blank"
  );
});

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files?.[0];
  if (file) {
    setUploadStatus(`${file.name} selected.`);
  } else {
    setUploadStatus("No file selected.");
  }
});
