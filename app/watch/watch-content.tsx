"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorCard from "@/components/ErrorCard";
import type HlsClass from "hls.js";

type Channel = {
  tvgId: string;
  name: string;
  logo: string;
  group: string;
  urls: string[];
};

export default function WatchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [channels, setChannels] = useState<Channel[]>([]);
  const [query, setQuery] = useState(initialQ);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [deadChannels, setDeadChannels] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsClass | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const proxyBase = process.env.NEXT_PUBLIC_PROXY_URL || "/api/watch/proxy";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/watch/channels");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!cancelled) setChannels(data.channels || []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load channels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = q
      ? channels.filter((c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
      : channels;
    return list.filter((c) => !deadChannels.has(c.name.toLowerCase()));
  }, [query, channels, deadChannels]);

  const deadCount = useMemo(
    () => channels.filter((c) => deadChannels.has(c.name.toLowerCase())).length,
    [channels, deadChannels]
  );

  const currentIndex = useMemo(() => {
    if (!selected) return -1;
    return filtered.findIndex((c) => c.name === selected.name);
  }, [selected, filtered]);

  const rawUrl = selected ? selected.urls[urlIndex] : null;
  const currentUrl = useProxy && rawUrl ? `${proxyBase}?url=${encodeURIComponent(rawUrl)}` : rawUrl;
  const hasBackup = selected && selected.urls.length > 1;

  function destroyPlayer() {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) videoRef.current.src = "";
  }

  function selectChannel(ch: Channel) {
    destroyPlayer();
    setSelected(ch);
    setUrlIndex(0);
    setStreamError(false);
    if (sidebarRef.current) {
      const el = sidebarRef.current.querySelector(`[data-channel="${ch.name}"]`);
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function closePlayer() {
    destroyPlayer();
    setSelected(null);
    setUrlIndex(0);
    setStreamError(false);
  }

  function markChannelDead(name: string) {
    setDeadChannels((prev) => {
      const next = new Set(prev);
      next.add(name.toLowerCase());
      return next;
    });
  }

  function prevChannel() {
    if (currentIndex <= 0) return;
    selectChannel(filtered[currentIndex - 1]);
  }

  function nextChannel() {
    if (currentIndex < 0 || currentIndex >= filtered.length - 1) return;
    selectChannel(filtered[currentIndex + 1]);
  }

  const retryWithNext = useCallback(() => {
    if (!selected) return;
    setStreamError(false);
    const next = (urlIndex + 1) % selected.urls.length;
    setUrlIndex(next);
  }, [selected, urlIndex]);

  useEffect(() => {
    if (!selected || !videoRef.current || streamError) return;

    const videoEl = videoRef.current;
    const url = useProxy && selected.urls[urlIndex]
      ? `${proxyBase}?url=${encodeURIComponent(selected.urls[urlIndex])}`
      : selected.urls[urlIndex];
    if (!url) return;

    import("hls.js").then((HlsModule) => {
      const Hls = HlsModule.default;
      destroyPlayer();

      function onError() {
        setStreamError(true);
      }

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoEl.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) onError();
        });
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = url;
        videoEl.addEventListener("error", onError, { once: true });
        videoEl.play().catch(() => {});
      }
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoEl.src = "";
    };
  }, [selected, urlIndex, streamError, useProxy, proxyBase]);

  useEffect(() => {
    if (!streamError || !selected) return;
    const next = urlIndex + 1;
    if (next < selected.urls.length) {
      const t = setTimeout(() => {
        setStreamError(false);
        setUrlIndex(next);
      }, 2000);
      return () => clearTimeout(t);
    } else {
      markChannelDead(selected.name);
      const t = setTimeout(() => {
        destroyPlayer();
        setSelected(null);
        setUrlIndex(0);
        setStreamError(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [streamError, selected, urlIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <LoadingSpinner text="Loading channels..." />
      </div>
    );
  }

  if (error) return <ErrorCard message={error} />;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left: Player */}
      <div className="flex-1 min-w-0 order-1 lg:order-none">
        {selected && currentUrl ? (
          <div className="lg:sticky lg:top-4">
            <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                playsInline
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23000'/%3E%3C/svg%3E"
              />
            </div>

            {/* Player controls */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={prevChannel}
                disabled={currentIndex <= 0}
                className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-300 hover:bg-[#243824] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◄ Prev
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{selected.name}</p>
                <p className="text-xs text-gray-500 truncate">{selected.group}</p>
              </div>

              <button
                onClick={nextChannel}
                disabled={currentIndex < 0 || currentIndex >= filtered.length - 1}
                className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-300 hover:bg-[#243824] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next ►
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">LIVE</span>

              {streamError && (
                <span className="text-xs text-yellow-400 ml-1">Stream failed</span>
              )}

              {hasBackup && (
                <span className="text-xs text-gray-500">
                  {selected.urls.length} source{selected.urls.length > 1 ? "s" : ""}
                </span>
              )}

              <button
                onClick={() => { destroyPlayer(); setUseProxy(!useProxy); }}
                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                  useProxy
                    ? "bg-[#4ade80] text-black"
                    : "bg-[#1a2e1a] text-gray-400 hover:bg-[#243824]"
                }`}
                title="Route stream through server to bypass ISP blocks"
              >
                {useProxy ? "Proxy ON" : "Proxy"}
              </button>

              <button
                onClick={closePlayer}
                className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-400 hover:bg-[#243824]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:sticky lg:top-4 items-center justify-center rounded-lg border border-dashed border-[#2a4a2a] min-h-[300px] text-gray-500">
            <div className="text-center">
              <p className="text-4xl mb-2 opacity-30">[ ]</p>
              <p className="text-sm">
                {filtered.length === 0
                  ? "No channels available"
                  : "Select a channel to start watching"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Channel Sidebar */}
      <div ref={sidebarRef} className="w-full lg:w-80 shrink-0 order-none lg:order-1">
        <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {/* Mobile player (shows above sidebar on small screens) */}
          {selected && currentUrl && (
            <div className="lg:hidden mb-4">
              <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23000'/%3E%3C/svg%3E"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                  onClick={prevChannel}
                  disabled={currentIndex <= 0}
                  className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-300 hover:bg-[#243824] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ◄ Prev
                </button>
                <span className="text-xs font-medium truncate flex-1">{selected.name}</span>
                <button
                  onClick={nextChannel}
                  disabled={currentIndex < 0 || currentIndex >= filtered.length - 1}
                  className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-300 hover:bg-[#243824] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next ►
                </button>
                <button
                  onClick={() => { destroyPlayer(); setUseProxy(!useProxy); }}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                    useProxy ? "bg-[#4ade80] text-black" : "bg-[#1a2e1a] text-gray-400"
                  }`}
                >
                  {useProxy ? "Proxy ON" : "Proxy"}
                </button>
                <button onClick={closePlayer} className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-400">Close</button>
              </div>
              {streamError && (
                <p className="text-xs text-yellow-400 mt-1">Stream failed — try a different channel</p>
              )}
            </div>
          )}

          <h2 className="text-sm font-bold mb-2">
            Channels
            {filtered.length > 0 && (
              <span className="text-xs font-normal text-gray-500 ml-2">({filtered.length})</span>
            )}
          </h2>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-[#1a2e1a] border border-[#2a4a2a] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#4ade80] transition-colors mb-3"
          />

          {deadCount > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              <button
                onClick={() => setDeadChannels(new Set())}
                className="text-[#4ade80] hover:underline"
              >
                reset
              </button>
              <span className="text-gray-600"> · {deadCount} hidden</span>
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-sm">
                {query
                  ? "No channels match your search"
                  : deadCount > 0
                    ? `All ${channels.length} channels were unavailable`
                    : "No channels available"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((ch, i) => (
                <ChannelCard
                  key={`${ch.tvgId || ch.name}-${i}`}
                  channel={ch}
                  isSelected={selected?.name === ch.name}
                  onSelect={selectChannel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelCard({
  channel,
  isSelected,
  onSelect,
}: {
  channel: Channel;
  isSelected: boolean;
  onSelect: (c: Channel) => void;
}) {
  return (
    <button
      data-channel={channel.name}
      onClick={() => onSelect(channel)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
        isSelected
          ? "bg-[#1a3a1a] border border-[#4ade80]"
          : "bg-[#0f1a0f] border border-transparent hover:bg-[#1a2e1a]"
      }`}
    >
      {channel.logo ? (
        <img
          src={channel.logo}
          alt=""
          className="w-8 h-8 object-contain rounded shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-8 h-8 rounded bg-[#1a2e1a] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium truncate ${isSelected ? "text-[#4ade80]" : "text-gray-200"}`}>
          {channel.name}
        </p>
        <p className="text-[10px] text-gray-600 truncate">{channel.group}</p>
      </div>
      {isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
      )}
      {channel.urls.length > 1 && !isSelected && (
        <span className="text-[10px] text-gray-600 shrink-0">+{channel.urls.length - 1}</span>
      )}
    </button>
  );
}
