const HistoryList = ({ items, isLoading, error, onSelect, onDelete }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Saved notes
          </p>
          <h3 className="text-xl font-semibold text-slate-900">History</h3>
        </div>
        {isLoading ? (
          <span className="text-xs font-semibold text-slate-400">Loading…</span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !items.length ? (
          <p className="text-sm text-slate-500">No saved notes yet.</p>
        ) : null}

        {items.map((item) => (
          <div
            key={item._id}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <button
              type="button"
              onClick={() => onSelect(item._id)}
              className="flex flex-1 flex-col text-left"
            >
                <span className="font-medium text-slate-800">
                  {item.summary?.title || item.originalName || "Voice note"}
                </span>
                <span className="text-xs text-slate-400">
                  {item.originalName ? `${item.originalName} · ` : ""}
                  {new Date(item.createdAt).toLocaleString()}
                </span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-indigo-500">View</span>
              <button
                type="button"
                onClick={() => onDelete(item._id)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Delete history item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryList;
