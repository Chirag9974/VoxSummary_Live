const SummarySection = ({ summary }) => {
  if (!summary) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        No summary yet. Upload an audio file to get insights.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Summary
          </p>
          <h3 className="text-xl font-semibold text-slate-900">{summary.title}</h3>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Key points</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {summary.keyPoints?.map((point, index) => (
              <li key={`${point}-${index}`} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Action items</p>
          {summary.actionItems?.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {summary.actionItems.map((item, index) => (
                <li key={`${item.task}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-700">{item.task}</p>
                  <p className="text-xs text-slate-400">
                    Deadline: {item.deadline || "Not specified"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No action items detected.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SummarySection;
