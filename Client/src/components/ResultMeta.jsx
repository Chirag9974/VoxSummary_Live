const ResultMeta = ({ audioPath, createdAt, noteId, apiBaseUrl }) => {
  if (!audioPath && !createdAt && !noteId) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
      {audioPath ? (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          Stored at: {audioPath}
        </span>
      ) : null}
      {createdAt ? (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          Processed: {createdAt}
        </span>
      ) : null}
      {noteId ? (
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-600 transition hover:bg-indigo-100"
            href={`${apiBaseUrl}/api/voice/notes/${noteId}/download?type=transcript`}
          >
            Download transcript
          </a>
          <a
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-600 transition hover:bg-indigo-100"
            href={`${apiBaseUrl}/api/voice/notes/${noteId}/download?type=summary`}
          >
            Download summary
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default ResultMeta;
