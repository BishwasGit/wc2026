import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Nav from "./nav";

export const metadata: Metadata = {
  title: {
    default: "WC 2026 — Live Scores and Predictions",
    template: "%s | WC 2026",
  },
  description: "FIFA World Cup 2026 live scores, group standings, and match predictions",
  metadataBase: new URL("https://2026worldcuplive.vercel.app"),
  openGraph: {
    siteName: "WC 2026",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "google-adsense-account": "ca-pub-4818330169144190",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f0a] text-white min-h-screen">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4818330169144190"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var l=window.location,r=function(){try{l.replace('about:blank')}catch(e){}try{document.documentElement.innerHTML='<body style="background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="color:#ff3333;font-family:monospace;font-size:14px;text-align:center">INSPECTION_NOT_ALLOWED</div></body>'}catch(e){}};document.addEventListener('keydown',function(e){if(e.key==='F12'||e.keyCode===123||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))||(e.ctrlKey&&e.key==='U')){e.preventDefault();e.stopPropagation();r();return false}},true);document.addEventListener('contextmenu',function(e){e.preventDefault();r()},true);setInterval(function(){var s=performance.now();debugger;var e=performance.now();if(e-s>150)r()},1000)})();`,
        }} />
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-[#1a2e1a] text-center text-xs text-gray-600 py-6 mt-12">
          Data by football-data.org · WC2026
        </footer>
      </body>
    </html>
  );
}
