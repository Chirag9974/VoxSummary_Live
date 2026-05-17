import { useEffect, useMemo, useState } from "react";

const DownloadPage = ({ noteId, apiBaseUrl }) => {
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!noteId) return;

    const fetchNote = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/voice/notes/${noteId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || "Failed to load note");
        }

        setNote(payload.data);
      } catch (err) {
        setError(err?.message || "Unable to load note");
      }
    };

    fetchNote();
  }, [apiBaseUrl, noteId]);

  const summaryTitle = useMemo(() => {
    if (!note?.summary?.title) return "meeting-summary";
    return note.summary.title;
  }, [note]);

  const baseName = useMemo(() => {
    if (!note?.originalName) return "meeting";
    return note.originalName.replace(/\.[^/.]+$/, "");
  }, [note]);

  const summaryFilename = `${summaryTitle.replace(/[^a-z0-9_.-]+/gi, "_")}.summary.txt`;
  const transcriptFilename = `${baseName}.txt`;

  const transcriptUrl = `${apiBaseUrl}/api/voice/notes/${noteId}/download?type=transcript&filename=${encodeURIComponent(transcriptFilename)}`;
  const summaryUrl = `${apiBaseUrl}/api/voice/notes/${noteId}/download?type=summary&filename=${encodeURIComponent(summaryFilename)}`;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Download ready</h1>
          <p className="mt-2 text-sm text-slate-500">
            Choose the transcript or summary download below.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {note ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {note.summary?.title || "Summary"}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {note.originalName || "Voice note"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600"
                href={transcriptUrl}
              >
                Download transcript
              </a>
              <a
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
                href={summaryUrl}
              >
                Download summary
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DownloadPage;
