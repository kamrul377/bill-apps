export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        {/* Text */}
        <p className="text-xs font-semibold text-secondary dark:text-slate-400 tracking-wider uppercase animate-pulse">
          FnF Online Ops Loading...
        </p>
      </div>
    </div>
  );
}