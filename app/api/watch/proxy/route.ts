import { NextResponse } from "next/server";

const PROXY_BASE = "/api/watch/proxy?url=";

function rewriteM3U(body: string, baseUrl: string): string {
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      try {
        const absolute = trimmed.startsWith("http")
          ? trimmed
          : new URL(trimmed, baseUrl).href;
        return `${PROXY_BASE}${encodeURIComponent(absolute)}`;
      } catch {
        return line;
      }
    })
    .join("\n");
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "*",
      "access-control-max-age": "86400",
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    if (
      contentType.includes("m3u8") ||
      contentType.includes("mpegurl") ||
      url.endsWith(".m3u8")
    ) {
      const body = await res.text();
      const rewritten = rewriteM3U(body, baseUrl);
      return new NextResponse(rewritten, {
        headers: {
          "content-type": "application/vnd.apple.mpegurl",
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
        },
      });
    }

    return new NextResponse(res.body, {
      headers: {
        "content-type": contentType || "application/octet-stream",
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
