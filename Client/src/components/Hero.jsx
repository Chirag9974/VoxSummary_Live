const Hero = () => {
  return (
    <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Summaries in seconds
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Upload an audio file and get key points, action items, and a clean transcript.
        </h2>
        <p className="text-base text-slate-600">
          The pipeline uses Faster Whisper for transcription and Qwen 2.5 for
          structured summaries. Works great for meetings, interviews, and voice
          memos.
        </p>
      </div>
      <div className="grid gap-4">
        {[
          "Automatic transcription",
          "Bullet-point summaries",
          "Action item extraction",
          "MongoDB storage",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
              ✓
            </span>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
