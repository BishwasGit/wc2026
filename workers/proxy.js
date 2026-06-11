// Cloudflare Worker — HLS stream proxy
// Deploy: npx wrangler deploy workers/proxy.js --name iptv-proxy
// Then set NEXT_PUBLIC_PROXY_URL=https://iptv-proxy.your-name.workers.dev in Vercel

const PROXY_BASE = "/?url=";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "*",
          "access-control-max-age": "86400",
        },
      });
    }

    const target = url.searchParams.get("url");
    if (!target) {
      return new Response("Missing ?url=", { status: 400 });
    }

    try {
      const upstream = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const contentType = upstream.headers.get("content-type") || "";
      const isM3U =
        contentType.includes("m3u8") ||
        contentType.includes("mpegurl") ||
        target.endsWith(".m3u8");

      if (isM3U) {
        const body = await upstream.text();
        const baseUrl = target.substring(0, target.lastIndexOf("/") + 1);
        const origin = url.origin;

        const rewritten = body
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return line;
            try {
              const absolute = trimmed.startsWith("http")
                ? trimmed
                : new URL(trimmed, baseUrl).href;
              return `${origin}${PROXY_BASE}${encodeURIComponent(absolute)}`;
            } catch {
              return line;
            }
          })
          .join("\n");

        return new Response(rewritten, {
          headers: {
            "content-type": "application/vnd.apple.mpegurl",
            "access-control-allow-origin": "*",
            "cache-control": "no-cache",
          },
        });
      }

      // Binary segment — pass through
      return new Response(upstream.body, {
        headers: {
          "content-type": contentType || "application/octet-stream",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600",
        },
      });
    } catch (e) {
      return new Response(String(e), { status: 502 });
    }
  },
};
