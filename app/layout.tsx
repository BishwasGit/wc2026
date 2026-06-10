import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WC 2026 — Live Scores & Predictions",
  description: "FIFA World Cup 2026 live scores, group standings, and match predictions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f0a] text-white min-h-screen">
        <header className="border-b border-[#1a2e1a] sticky top-0 z-50 bg-[#0a0f0a]/95 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="text-[#4ade80]">⚽</span>
              <span>WC<span className="text-[#4ade80]">2026</span></span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded hover:bg-[#1a2e1a] transition-colors text-gray-300 hover:text-white">Scores</Link>
              <Link href="/standings" className="px-3 py-1.5 rounded hover:bg-[#1a2e1a] transition-colors text-gray-300 hover:text-white">Groups</Link>
              <Link href="/predict" className="px-3 py-1.5 rounded hover:bg-[#1a2e1a] transition-colors text-gray-300 hover:text-white">Predict</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-[#1a2e1a] text-center text-xs text-gray-600 py-6 mt-12">
          Data by football-data.org · WC2026
        </footer>
      </body>
    </html>
  );
}
