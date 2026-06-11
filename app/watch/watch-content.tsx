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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsClass | null>(null);

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
    return q
      ? channels.filter((c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
      : channels;
  }, [query, channels]);

  const currentUrl = selected ? selected.urls[urlIndex] : null;
  const hasBackup = selected && selected.urls.length > 1;

  const retryWithNext = useCallback(() => {
    if (!selected) return;
    setStreamError(false);
    const next = (urlIndex + 1) % selected.urls.length;
    setUrlIndex(next);
  }, [selected, urlIndex]);

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
  }

  function closePlayer() {
    destroyPlayer();
    setSelected(null);
    setUrlIndex(0);
    setStreamError(false);
  }

  useEffect(() => {
    if (!selected || !videoRef.current || streamError) return;

    const videoEl = videoRef.current;
    const url = selected.urls[urlIndex];
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
  }, [selected, urlIndex, streamError]);

  const groups = [...new Set(filtered.map((c) => c.group).filter(Boolean))].sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          Live <span className="text-[#4ade80]">TV</span>
        </h1>
        <p className="text-sm text-gray-500">Watch live sports channels from around the world</p>
      </div>

      {selected && currentUrl && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {selected.logo && (
                <img src={selected.logo} alt="" className="w-8 h-8 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <div>
                <h2 className="font-semibold text-sm">{selected.name}</h2>
                <span className="text-xs text-gray-500">{selected.group}</span>
              </div>
            </div>
            <button onClick={closePlayer} className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-400 hover:bg-[#243824]">
              Close
            </button>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23000'/%3E%3C/svg%3E"
            />
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>

            {streamError && hasBackup && (
              <>
                <span className="text-xs text-yellow-400 ml-2">Stream failed</span>
                <button
                  onClick={retryWithNext}
                  className="text-xs px-3 py-1.5 rounded font-medium bg-yellow-900 text-yellow-200 hover:bg-yellow-800"
                >
                  Retry (backup {urlIndex + 1}/{selected.urls.length})
                </button>
              </>
            )}

            {streamError && !hasBackup && (
              <button
                onClick={retryWithNext}
                className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-gray-400 hover:bg-[#243824]"
              >
                Retry
              </button>
            )}

            {hasBackup && !streamError && (
              <span className="text-xs text-gray-500 ml-2">
                {selected.urls.length} source{selected.urls.length > 1 ? "s" : ""}
              </span>
            )}

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] ml-auto"
            >
              Open in VLC
            </a>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search channels..."
          className="w-full bg-[#1a2e1a] border border-[#2a4a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4ade80] transition-colors"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <LoadingSpinner text="Loading channels..." />
        </div>
      )}

      {error && <ErrorCard message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3 opacity-30">[ ]</p>
          <p>{query ? "No channels match your search" : "No sports channels available"}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.length > 1 && !query ? (
            groups.map((group) => (
              <div key={group} className="col-span-full">
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 mt-2 first:mt-0">
                  {group}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.filter((c) => c.group === group).map((ch, i) => (
                    <ChannelCard key={`${ch.tvgId || ch.name}-${i}`} channel={ch} onSelect={selectChannel} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            filtered.map((ch, i) => (
              <ChannelCard key={`${ch.tvgId || ch.name}-${i}`} channel={ch} onSelect={selectChannel} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChannelCard({ channel, onSelect }: { channel: Channel; onSelect: (c: Channel) => void }) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className="card p-3 flex items-center gap-3 text-left hover:border-[#4ade80] transition-colors"
    >
      {channel.logo ? (
        <img src={channel.logo} alt="" className="w-10 h-10 object-contain rounded shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <div className="w-10 h-10 rounded bg-[#1a2e1a] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{channel.name}</p>
        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
          {channel.group}
          {channel.urls.length > 1 && (
            <span className="text-[10px] text-[#4ade80]">({channel.urls.length} sources)</span>
          )}
        </p>
      </div>
    </button>
  );
}
