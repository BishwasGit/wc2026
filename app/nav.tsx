"use client";
import { useState, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/", label: "Scores" },
  { href: "/standings", label: "Groups" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/predict", label: "Predict" },
  { href: "/fantasy", label: "Fantasy" },
  { href: "/leaderboard", label: "Leaderboard" },
];

function NavInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(searchParams.get("nav") === "1");

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-[#1a2e1a] sticky top-0 z-50 bg-[#0a0f0a]/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          WC<span className="text-[#4ade80]">2026</span>
        </Link>
        <nav className="hidden md:flex gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded transition-colors ${
                isActive(l.href)
                  ? "text-[#4ade80] border-b-2 border-[#4ade80]"
                  : "text-gray-300 hover:text-white hover:bg-[#1a2e1a]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Toggle navigation"
        >
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${open ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>
      <div className={`md:hidden border-t border-[#1a2e1a] ${open ? "block" : "hidden"}`}>
        <nav className="max-w-5xl mx-auto px-4 py-2 flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded transition-colors ${
                isActive(l.href)
                  ? "text-[#4ade80] bg-[#1a2e1a]"
                  : "text-gray-300 hover:text-white hover:bg-[#1a2e1a]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function Nav() {
  return (
    <Suspense fallback={
      <header className="border-b border-[#1a2e1a] sticky top-0 z-50 bg-[#0a0f0a]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="font-bold text-lg tracking-tight">WC<span className="text-[#4ade80]">2026</span></span>
        </div>
      </header>
    }>
      <NavInner />
    </Suspense>
  );
}
