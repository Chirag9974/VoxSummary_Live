import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import UploadForm from "./components/UploadForm";
import SummarySection from "./components/SummarySection";
import TranscriptSection from "./components/TranscriptSection";
import ResultMeta from "./components/ResultMeta";
import Footer from "./components/Footer";
import HistoryList from "./components/HistoryList";
import DownloadPage from "./components/DownloadPage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const downloadMatch = window.location.pathname.match(/^\/download\/(.+)$/);
  const downloadId = downloadMatch ? downloadMatch[1] : null;

  const formattedDate = useMemo(() => {
    if (!result?.createdAt) return "";
    return new Date(result.createdAt).toLocaleString();
  }, [result]);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an audio file before uploading.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch(`${API_BASE_URL}/api/voice`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Upload failed");
      }

      setResult(payload.data);
      setHistory((prev) => [payload.data, ...prev.filter((item) => item._id !== payload.data._id)]);
    } catch (err) {
      setError(err?.message || "Something went wrong while processing the audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/history`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to load history");
      }

      setHistory(payload.data || []);
    } catch (err) {
      setHistoryError(err?.message || "Unable to load saved notes.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSelectNote = async (noteId) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/notes/${noteId}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to load note");
      }

      setResult(payload.data);
    } catch (err) {
      setError(err?.message || "Unable to load note details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/notes/${noteId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to delete note");
      }

      setHistory((prev) => prev.filter((item) => item._id !== noteId));
      if (result?._id === noteId) {
        setResult(null);
      }
    } catch (err) {
      setHistoryError(err?.message || "Unable to delete note.");
    }
  };

  useEffect(() => {
    if (downloadId) {
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchHistory();
    }, 0);

    const intervalId = setInterval(() => {
      fetchHistory();
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [downloadId]);

  if (downloadId) {
    return <DownloadPage noteId={downloadId} apiBaseUrl={API_BASE_URL} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <Header />
        <Hero />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <UploadForm
            file={file}
            onFileChange={setFile}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
          <SummarySection summary={result?.summary} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <TranscriptSection transcription={result?.transcription} />
          <div className="flex flex-col gap-6">
            <HistoryList
              items={history}
              isLoading={isHistoryLoading}
              error={historyError}
              onSelect={handleSelectNote}
              onDelete={handleDeleteNote}
            />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Latest result
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Upload details</h3>
              <p className="mt-2 text-sm text-slate-500">
                Your processed file metadata appears here after a successful upload.
              </p>
              <div className="mt-4">
                <ResultMeta
                  audioPath={result?.audioPath}
                  createdAt={formattedDate}
                  noteId={result?._id}
                  apiBaseUrl={API_BASE_URL}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 text-sm text-indigo-700">
              <p className="font-semibold">Tip</p>
              <p className="mt-2">
                If the summary looks off, try re-recording with less background noise
                and shorter pauses between sentences.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default App;
