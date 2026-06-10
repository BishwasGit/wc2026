"use client";
import { useState, type FormEvent } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    // Placeholder for Mailchimp API integration
    console.log("Email capture:", email);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card p-4 text-center">
        <p className="text-[#4ade80] text-sm font-medium">
          Thanks for signing up! We will keep you updated.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-1">Stay updated</h3>
      <p className="text-xs text-gray-500 mb-3">
        Get notified about match results and tournament news.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded text-sm font-medium bg-[#4ade80] text-black hover:bg-[#3bca6f] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
