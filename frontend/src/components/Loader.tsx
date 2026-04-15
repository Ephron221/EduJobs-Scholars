export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-transparent border-t-cyan-600 rounded-full animate-spin animation-delay-200" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-white dark:bg-black">
      <Loader text="Loading EduJobs Scholars..." />
    </div>
  );
}
