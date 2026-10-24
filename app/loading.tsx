export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-[#D9C8F0] border-t-[#7B5EA7] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1B1530] dark:text-white font-semibold text-sm">Finding verified student stays...</p>
        <p className="text-[#6B6580] dark:text-purple-300/70 text-xs mt-1 uppercase tracking-[0.08em] font-bold">Connecting to Nestora</p>
      </div>
    </div>
  );
}
