const Header = () => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-indigo-500">VoxSummary</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Turn voice notes into clear summaries
        </h1>
      </div>
      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
        AI-powered with Qwen 2.5 + Whisper
      </div>
    </header>
  );
};

export default Header;
