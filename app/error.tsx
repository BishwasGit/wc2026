"use client";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="card p-6 max-w-md mx-auto text-center">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => unstable_retry()}
          className="text-xs px-4 py-2 rounded font-medium bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
