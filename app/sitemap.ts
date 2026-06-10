import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://2026worldcuplive.vercel.app";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/standings`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/predict`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/fantasy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/leaderboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
