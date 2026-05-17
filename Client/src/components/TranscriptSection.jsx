const TranscriptSection = ({ transcription }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Transcript
          </p>
          <h3 className="text-xl font-semibold text-slate-900">Full transcription</h3>
        </div>
      </div>
      <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
        {transcription || "Transcript will appear here after processing."}
      </div>
    </section>
  );
};

export default TranscriptSection;
