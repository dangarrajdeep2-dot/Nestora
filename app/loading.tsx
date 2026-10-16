export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Finding verified student stays...</p>
        <p className="text-slate-400 text-xs mt-1">Connecting to Nestora</p>
      </div>
    </div>
  );
}

