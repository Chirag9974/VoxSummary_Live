import { useMemo } from "react";

const UploadForm = ({ file, onFileChange, onSubmit, isLoading, error }) => {
  const fileLabel = useMemo(() => {
    if (!file) {
      return "Drop an audio file or click to browse";
    }
    return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Upload audio</h3>
          <p className="text-sm text-slate-500">
            Supported formats: mp3, wav, m4a (max 10 MB).
          </p>
        </div>

        <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
          <div className="rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Choose file
          </div>
          <p className="text-sm font-medium text-slate-700">{fileLabel}</p>
          <p className="text-xs text-slate-400">
            The upload starts when you click “Generate Summary”.
          </p>
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Processing audio…" : "Generate Summary"}
        </button>
      </div>
    </section>
  );
};

export default UploadForm;
