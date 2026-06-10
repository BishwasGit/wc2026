"use client";

export default function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card p-4 border-red-900">
      <p className="text-red-400 text-sm">{message}</p>
      {message.includes("401") && (
        <p className="text-gray-500 text-xs mt-1">Add your football-data.org API key to .env.local</p>
      )}
      {message.includes("429") && (
        <p className="text-gray-500 text-xs mt-1">API rate limit reached. Please wait a moment and try again.</p>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-xs px-3 py-1.5 rounded bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
