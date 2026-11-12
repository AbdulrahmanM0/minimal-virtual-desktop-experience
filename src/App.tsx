import { useEffect, useRef, useState, useCallback } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Edit these arrays to control your desktop. No need to touch components.
// ────────────────────────────────────────────────────────────────────────────

type IconType = "link" | "gallery" | "music" | "folder";

interface DesktopIconConfig {
  id: string;
  name: string;
  image: string; // emoji or URL — using emoji for minimal premium look
  url?: string;
  type: IconType;
  description?: string;
}

const desktopIcons: DesktopIconConfig[] = [
  { id: "gallery", name: "Gallery", image: "◐", type: "gallery", description: "Photos & Memories" },
  { id: "music", name: "Music", image: "♫", type: "music", description: "Sound Collection" },
  { id: "studio", name: "Studio", image: "✦", type: "link", url: "https://example.com", description: "Creative Work" },
  { id: "journal", name: "Journal", image: "✎", type: "link", url: "https://example.com/journal", description: "Writings" },
  { id: "archive", name: "Archive", image: "⬢", type: "folder", description: "Past Projects" },
  { id: "contact", name: "Contact", image: "☎", type: "link", url: "mailto:hello@mira.studio", description: "Say Hello" },
];

const galleryImages: string[] = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
];

interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  cover: string;
  src: string;
  duration?: string;
}

const musicTracks: MusicTrack[] = [
  {
    id: 1,
    title: "Midnight Reverie",
    artist: "Luna Kline",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80&auto=format&fit=crop",
    src: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=lofi-study-112191.mp3",
    duration: "2:42",
  },
  {
    id: 2,
    title: "Cerulean",
    artist: "Noah Ellis",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80&auto=format&fit=crop",
    src: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=lofi-chill-medium-version-118246.mp3",
    duration: "2:28",
  },
  {
    id: 3,
    title: "Aurora Drift",
    artist: "Mira Chen",
    cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=500&q=80&auto=format&fit=crop",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soulful-meditation-122581.mp3",
    duration: "3:15",
  },
  {
    id: 4,
    title: "Paper Planes",
    artist: "Timo Hall",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80&auto=format&fit=crop",
    src: "https://cdn.pixabay.com/download/audio/2022/10/30/audio_8ef11ccf32.mp3?filename=lofi-nature-126355.mp3",
    duration: "2:54",
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}
function formatDateLong(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ─── WINDOW TYPES ───────────────────────────────────────────────────────────
type WindowId = string;
interface WindowState {
  id: WindowId;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const now = useClock();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zCounter, setZCounter] = useState(10);

  // mobile app open (full screen)
  const [mobileApp, setMobileApp] = useState<WindowId | null>(null);

  // gallery state
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // music state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = musicTracks[currentTrackIdx];

  // responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // audio events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnded = () => {
      if (currentTrackIdx < musicTracks.length - 1) {
        setCurrentTrackIdx((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIdx]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.play().catch(() => setIsPlaying(false));
    else a.pause();
  }, [isPlaying, currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // window management
  const openWindow = useCallback(
    (id: string) => {
      if (isMobile) {
        setMobileApp(id);
        return;
      }
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          // unminimize and bring to front
          const nz = zCounter + 1;
          setZCounter(nz);
          setActiveId(id);
          return prev.map((w) => (w.id === id ? { ...w, minimized: false, z: nz } : w));
        }
        const nz = zCounter + 1;
        setZCounter(nz);
        setActiveId(id);
        // default positions staggered
        const offset = prev.length * 28;
        const baseW = id === "gallery" ? 860 : 720;
        const baseH = id === "gallery" ? 520 : 440;
        return [
          ...prev,
          {
            id,
            minimized: false,
            maximized: false,
            x: 120 + offset,
            y: 60 + offset,
            w: Math.min(baseW, window.innerWidth - 40),
            h: Math.min(baseH, window.innerHeight - 120),
            z: nz,
          },
        ];
      });
    },
    [isMobile, zCounter]
  );

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeId === id) setActiveId(null);
  };
  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  };
  const toggleMaximize = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  };
  const focusWindow = (id: string) => {
    const nz = zCounter + 1;
    setZCounter(nz);
    setActiveId(id);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: nz } : w)));
  };

  // drag handling
  const dragRef = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number } | null>(null);
  const onWindowPointerDown = (e: React.PointerEvent, id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win || win.maximized) return;
    focusWindow(id);
    dragRef.current = { id, ox: win.x, oy: win.y, sx: e.clientX, sy: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { id, ox, oy, sx, sy } = dragRef.current;
      const nx = ox + (e.clientX - sx);
      const ny = oy + (e.clientY - sy);
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x: Math.max(0, nx), y: Math.max(0, ny) } : w)));
    };
    const up = () => (dragRef.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const handleIconActivate = (icon: DesktopIconConfig) => {
    if (icon.type === "link" && icon.url) {
      window.open(icon.url, "_blank");
      return;
    }
    if (icon.type === "folder") {
      // for demo, open gallery as folder
      openWindow("gallery");
      return;
    }
    openWindow(icon.id);
  };

  const handleDeselect = () => setSelectedIcon(null);

  // ── render helpers ──
  const visibleWindows = windows.filter((w) => !w.minimized);
  const minimizedWindows = windows.filter((w) => w.minimized);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#0a0a0b] select-none antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* GLOBAL STYLES */}
      <style>{`
        *{scrollbar-width: thin; scrollbar-color: #d1d1d1 transparent}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:#d1d1d1;border-radius:999px}
        input[type="range"]{ -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer }
        input[type="range"]::-webkit-slider-runnable-track{ height:3px; background:rgba(0,0,0,0.08); border-radius:999px }
        input[type="range"]::-webkit-slider-thumb{ -webkit-appearance:none; width:14px; height:14px; background:#111; border-radius:999px; margin-top:-5.5px; box-shadow:0 1px 4px rgba(0,0,0,0.2) }
        input[type="range"]::-moz-range-track{ height:3px; background:rgba(0,0,0,0.08); border-radius:999px }
        input[type="range"]::-moz-range-thumb{ width:14px; height:14px; background:#111; border:none; border-radius:999px }
      `}</style>

      {/* ============ MOBILE LAYOUT ============ */}
      {isMobile ? (
        <div className="relative h-full w-full overflow-hidden flex flex-col">
          {/* Mobile Wallpaper */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          </div>

          {/* Status Bar */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-2 text-white">
            <span className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "Inter" }}>{formatTime(now)}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium opacity-90">●●●</span>
              <div className="flex items-center gap-0.5">
                <div className="h-2.5 w-0.5 rounded-full bg-white/90" />
                <div className="h-3 w-0.5 rounded-full bg-white/90" />
                <div className="h-3.5 w-0.5 rounded-full bg-white/90" />
                <div className="h-2 w-0.5 rounded-full bg-white/40" />
              </div>
              <div className="ml-1 flex h-3 w-6 items-center rounded-[4px] border border-white/70 p-[2px]">
                <div className="h-full w-4 rounded-[2px] bg-white" />
              </div>
            </div>
          </div>

          {/* Date widget */}
          <div className="relative z-10 px-6 pt-6">
            <p className="text-[13px] font-medium tracking-[0.14em] text-white/80 uppercase">{formatDateLong(now)}</p>
            <h1 className="mt-1 text-[42px] font-light leading-none tracking-[-0.04em] text-white" style={{ fontFamily: "Instrument Serif, serif" }}>
              Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"},<br />
              <span className="italic font-normal">Alex</span>
            </h1>
            <p className="mt-3 text-sm font-normal leading-relaxed text-white/70 max-w-[280px]">
              Minimal desktop — tap an app to begin. Your space, distilled.
            </p>
          </div>

          {/* Search pill */}
          <div className="relative z-10 mx-6 mt-6 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.16)]">
            <span className="text-[13px] text-black/40">⌕</span>
            <span className="text-sm font-medium text-black/60">Search apps, files, projects…</span>
            <span className="ml-auto text-[11px] font-medium tracking-wide text-black/30">↗</span>
          </div>

          {/* App Grid */}
          <div className="relative z-10 flex-1 px-5 pt-8">
            <div className="grid grid-cols-4 gap-4">
              {desktopIcons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconActivate(icon)}
                  className="flex flex-col items-center gap-2.5 group"
                >
                  <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.96] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
                    {icon.type === "gallery" ? (
                      <div className="h-[68px] w-[68px] overflow-hidden rounded-[18px]">
                        <img src={galleryImages[0]} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 rounded-[18px] ring-1 ring-black/5" />
                      </div>
                    ) : icon.type === "music" ? (
                      <div className="h-[68px] w-[68px] overflow-hidden rounded-[18px]">
                        <img src={musicTracks[0].cover} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[18px]">
                          <span className="text-white text-xl">♫</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[28px] font-light tracking-tight text-[#111]" style={{ fontFamily: "Instrument Serif, serif" }}>{icon.image}</span>
                    )}
                    {/* notification dot for demo */}
                    {icon.id === "music" && isPlaying && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff3b30] ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">{icon.name}</span>
                </button>
              ))}
            </div>

            {/* Recent widget */}
            <div className="mt-8 rounded-[20px] bg-white/92 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-black/50">Continue</p>
                <span className="text-[11px] font-medium text-black/30">Updated just now</span>
              </div>
              <div className="mt-3 flex gap-3">
                <img src={galleryImages[1]} alt="" className="h-14 w-20 rounded-xl object-cover" />
                <div>
                  <p className="text-[13px] font-semibold leading-tight text-[#111]">Highlands — Editorial Set</p>
                  <p className="mt-1 text-xs leading-relaxed text-black/50 line-clamp-2">A quiet study in light, fog and northern distance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dock */}
          <div className="relative z-10 px-4 pb-8 pt-4">
            <div className="mx-auto flex max-w-[360px] items-center justify-between rounded-[28px] bg-white/95 backdrop-blur-2xl px-3 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.22)]">
              <button onClick={() => setMobileApp("gallery")} className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#111] text-white shadow-sm transition active:scale-95">
                <span className="text-sm font-medium tracking-widest">◐</span>
              </button>
              <button onClick={() => setMobileApp("music")} className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-white ring-1 ring-black/10 text-[#111] shadow-sm transition active:scale-95">
                <span className="text-lg">♫</span>
              </button>
              <button onClick={() => window.open("https://example.com","_blank")} className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f2f2f2] text-[#111] shadow-sm transition active:scale-95">
                <span className="text-[16px]">✦</span>
              </button>
              <button onClick={() => window.open("mailto:hello@mira.studio","_blank")} className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f2f2f2] text-[#111] shadow-sm transition active:scale-95">
                <span className="text-[16px]">☎</span>
              </button>
            </div>
            <div className="mx-auto mt-3 h-1 w-32 rounded-full bg-white/90" />
          </div>

          {/* Mobile App Full Screen */}
          {mobileApp && (
            <div className="absolute inset-0 z-20 flex flex-col bg-[#fcfcf9] animate-[slideUp_0.42s_cubic-bezier(0.32,0.72,0,1)]">
              <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
              <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0">
                <button
                  onClick={() => setMobileApp(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm"
                >
                  ←
                </button>
                <span className="text-[13px] font-semibold tracking-wide text-[#111] uppercase">
                  {mobileApp === "gallery" ? "Gallery" : mobileApp === "music" ? "Music" : mobileApp}
                </span>
                <span className="h-8 w-8" />
              </div>
              <div className="flex-1 overflow-auto">
                {mobileApp === "gallery" ? (
                  <MobileGallery
                    images={galleryImages}
                    lightboxIdx={lightboxIdx}
                    setLightboxIdx={setLightboxIdx}
                  />
                ) : mobileApp === "music" ? (
                  <MobileMusic
                    tracks={musicTracks}
                    idx={currentTrackIdx}
                    setIdx={setCurrentTrackIdx}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    audioRef={audioRef}
                    volume={volume}
                    setVolume={setVolume}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    setCurrentTime={setCurrentTime}
                  />
                ) : (
                  <div className="p-6 text-sm text-black/60">App not found.</div>
                )}
              </div>
            </div>
          )}

          {/* Lightbox for mobile */}
          {lightboxIdx !== null && (
            <Lightbox
              images={galleryImages}
              idx={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
              onPrev={() => setLightboxIdx((i) => (i! > 0 ? i! - 1 : galleryImages.length - 1))}
              onNext={() => setLightboxIdx((i) => (i! < galleryImages.length - 1 ? i! + 1 : 0))}
            />
          )}
        </div>
      ) : (
        /* ============ DESKTOP LAYOUT ============ */
        <div className="relative h-full w-full overflow-hidden bg-[#f0efe9]" onClick={handleDeselect}>
          {/* Wallpaper */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2000&q=80&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover"
            />
            {/* warm film overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff9e6]/20 via-transparent to-[#0b1220]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-white/10" />
            {/* subtle grain */}
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.95'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")` }} />
          </div>

          {/* Top menu bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] px-4 text-[12px]">
            <div className="flex items-center gap-5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#111] text-white text-[11px] font-bold">◯</span>
              <span className="font-semibold tracking-tight text-[#111]">Mira</span>
              <span className="hidden md:flex items-center gap-4 font-medium text-black/60">
                <span>File</span><span>Edit</span><span>View</span><span>Window</span><span>Help</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-2 font-medium text-black/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Focus
              </span>
              <span className="flex items-center gap-3 font-medium text-[#111]">
                <span>{formatDate(now)}</span>
                <span className="font-semibold">{formatTime(now)}</span>
              </span>
            </div>
          </div>

          {/* Desktop Icons - left column, spacious */}
          <div className="absolute left-6 top-12 z-10 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
            {desktopIcons.map((icon) => (
              <button
                key={icon.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIcon(icon.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleIconActivate(icon);
                }}
                className={`group flex w-[88px] flex-col items-center gap-2 rounded-[14px] p-2 pt-2.5 transition-all ${
                  selectedIcon === icon.id ? "bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl ring-1 ring-black/5" : "hover:bg-white/60 hover:backdrop-blur-xl"
                }`}
              >
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] transition-transform group-active:scale-[0.97] ${
                    selectedIcon === icon.id ? "scale-[1.02]" : ""
                  }`}
                  style={{
                    background:
                      icon.type === "gallery"
                        ? "linear-gradient(135deg, #fff 0%, #f5f3ef 100%)"
                        : icon.type === "music"
                        ? "linear-gradient(135deg, #111 0%, #2a2a2a 100%)"
                        : icon.id === "studio"
                        ? "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                        : icon.id === "archive"
                        ? "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #ececec 100%)",
                  }}
                >
                  {icon.type === "gallery" ? (
                    <span className="text-[18px] tracking-widest text-[#111]">◐</span>
                  ) : icon.type === "music" ? (
                    <span className="text-[18px] text-white">♫</span>
                  ) : (
                    <span className="text-[20px] font-light text-[#111]" style={{ fontFamily: "Instrument Serif, serif" }}>
                      {icon.image}
                    </span>
                  )}
                </div>
                <span className={`text-center text-[11px] font-medium leading-tight tracking-tight px-1 py-0.5 rounded-md ${selectedIcon === icon.id ? "bg-[#111] text-white" : "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"}`}>
                  {icon.name}
                </span>
                {icon.description && (
                  <span className="hidden -mt-1 text-[10px] font-medium leading-none text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">{icon.description}</span>
                )}
              </button>
            ))}

            {/* tiny helper hint */}
            <div className="mt-4 w-[88px] rounded-xl bg-black/70 backdrop-blur-xl px-3 py-2.5 text-center">
              <p className="text-[10px] font-medium leading-relaxed text-white/80">Double-click<br />to open</p>
            </div>
          </div>

          {/* Center greeting card when no windows */}
          {windows.length === 0 && (
            <div className="absolute left-1/2 top-1/2 z-10 w-[min(560px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-[24px] bg-white/85 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.8)_inset] ring-1 ring-black/5 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#ffecd2] via-[#fcb69f] to-[#111]" />
                <div className="px-8 py-8">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-black/40 uppercase">Virtual Desktop — Mira Studio</p>
                  <h1 className="mt-3 text-[40px] font-light leading-[0.9] tracking-[-0.04em] text-[#0f0f0f]" style={{ fontFamily: "Instrument Serif, serif" }}>
                    A calmer way to<br />
                    <span className="italic font-normal">show your work.</span>
                  </h1>
                  <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-black/60">
                    This is your minimal desktop. Open Gallery and Music from the icons on the left. Add your own projects by editing the config — no component changes needed.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button onClick={() => openWindow("gallery")} className="rounded-full bg-[#111] px-5 py-2.5 text-[13px] font-medium tracking-tight text-white shadow hover:bg-black transition">
                      Open Gallery →
                    </button>
                    <button onClick={() => openWindow("music")} className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium tracking-tight text-[#111] ring-1 ring-black/10 hover:bg-zinc-50 transition">
                      Play Music
                    </button>
                    <span className="text-xs font-medium text-black/30">or double-click any icon</span>
                  </div>
                  <div className="mt-8 flex items-center gap-3 border-t border-black/5 pt-5 text-[11px] font-medium text-black/40">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> All systems calm</span>
                    <span>·</span>
                    <span>{formatDateLong(now)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Windows */}
          {visibleWindows.map((win) => (
            <div
              key={win.id}
              onMouseDown={() => focusWindow(win.id)}
              onClick={(e) => e.stopPropagation()}
              className={`absolute flex flex-col overflow-hidden rounded-[16px] bg-[#fbfbfa] shadow-[0_24px_64px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] transition-shadow ${
                activeId === win.id ? "shadow-[0_32px_80px_rgba(0,0,0,0.28)]" : "shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
              }`}
              style={
                win.maximized
                  ? { inset: "28px 8px 64px 8px", zIndex: win.z }
                  : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }
              }
            >
              {/* Title bar */}
              <div
                onPointerDown={(e) => onWindowPointerDown(e, win.id)}
                className="flex h-11 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-3 select-none touch-none cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => closeWindow(win.id)} className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f57] ring-1 ring-black/10 hover:brightness-95">
                      <span className="opacity-0 group-hover:opacity-100 text-[8px] text-black/60">×</span>
                    </button>
                    <button onClick={() => minimizeWindow(win.id)} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ffbd2e] ring-1 ring-black/10">
                      <span className="h-px w-2 bg-black/40" />
                    </button>
                    <button onClick={() => toggleMaximize(win.id)} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#28c840] ring-1 ring-black/10">
                      <span className="h-1.5 w-1.5 rounded-[1px] border border-black/30" />
                    </button>
                  </div>
                  <span className="ml-3 text-[12px] font-semibold tracking-tight text-[#111] capitalize">{win.id}</span>
                  <span className="hidden sm:inline text-[11px] font-medium text-black/30">— {win.id === "gallery" ? `${galleryImages.length} images` : `${musicTracks.length} tracks`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] font-medium text-black/30">{formatTime(now)}</span>
                  <div className="h-6 w-6 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[10px] text-black/40">◐</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto bg-[#fcfcf9]">
                {win.id === "gallery" ? (
                  <DesktopGallery images={galleryImages} onOpen={(idx) => setLightboxIdx(idx)} />
                ) : win.id === "music" ? (
                  <DesktopMusic
                    tracks={musicTracks}
                    idx={currentTrackIdx}
                    setIdx={setCurrentTrackIdx}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    audioRef={audioRef}
                    volume={volume}
                    setVolume={setVolume}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    setCurrentTime={setCurrentTime}
                  />
                ) : null}
              </div>
            </div>
          ))}

          {/* Lightbox */}
          {lightboxIdx !== null && (
            <Lightbox
              images={galleryImages}
              idx={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
              onPrev={() => setLightboxIdx((i) => (i! > 0 ? i! - 1 : galleryImages.length - 1))}
              onNext={() => setLightboxIdx((i) => (i! < galleryImages.length - 1 ? i! + 1 : 0))}
            />
          )}

          {/* Taskbar / Dock */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 backdrop-blur-2xl px-2.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            {/* brand */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-white text-[13px] font-bold">◯</div>
            <div className="mx-1 h-6 w-px bg-black/10" />

            {/* pinned apps */}
            {desktopIcons.slice(0, 4).map((icon) => {
              const isOpen = windows.some((w) => w.id === icon.id && !w.minimized);
              const isActive = activeId === icon.id && isOpen;
              return (
                <button
                  key={icon.id}
                  onClick={() => handleIconActivate(icon)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-[12px] text-[14px] transition-all hover:scale-105 active:scale-95 ${
                    isActive ? "bg-[#111] text-white shadow" : "bg-[#f2f2f2] text-[#111] hover:bg-white hover:shadow"
                  }`}
                  title={icon.name}
                >
                  {icon.image}
                  {isOpen && <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#111]" />}
                </button>
              );
            })}

            {/* minimized windows */}
            {minimizedWindows.length > 0 && (
              <>
                <div className="mx-1 h-6 w-px bg-black/10" />
                <div className="flex items-center gap-1.5">
                  {minimizedWindows.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        const nz = zCounter + 1;
                        setZCounter(nz);
                        setActiveId(w.id);
                        setWindows((prev) => prev.map((x) => (x.id === w.id ? { ...x, minimized: false, z: nz } : x)));
                      }}
                      className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-50 capitalize"
                    >
                      {w.id} •
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mx-1 h-6 w-px bg-black/10" />

            {/* clock pill */}
            <div className="flex items-center gap-2 rounded-full bg-[#f7f7f5] px-3 py-1.5 ring-1 ring-black/5">
              <span className="text-[12px] font-semibold tracking-tight text-[#111] tabular-nums">{formatTime(now)}</span>
              <span className="hidden sm:inline text-[11px] font-medium text-black/40">{formatDate(now)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} src={currentTrack.src} preload="metadata" crossOrigin="anonymous" />
    </div>
  );
}

// ─── DESKTOP GALLERY ──────────────────────────────────────────────────────────
function DesktopGallery({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="p-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-[22px] font-light tracking-[-0.03em] text-[#111]" style={{ fontFamily: "Instrument Serif, serif" }}>
            Gallery <span className="italic">— Selected Works</span>
          </h2>
          <p className="mt-1 text-xs font-medium tracking-wide text-black/40 uppercase">Drag to reorder · Click to view</p>
        </div>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">{images.length} photos</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="group relative overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5 aspect-[4/3] hover:ring-black/10 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <img src={src} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[#111] opacity-0 group-hover:opacity-100 transition">View →</span>
            <span className="absolute top-2 right-2 rounded-full bg-black/70 backdrop-blur px-2 py-1 text-[10px] font-medium text-white">{String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] font-medium text-black/30">Add images by editing <code className="rounded bg-black/5 px-1 py-0.5">src/config/galleryImages.js</code> — just add the file path.</p>
    </div>
  );
}

function MobileGallery({ images, lightboxIdx, setLightboxIdx }: { images: string[]; lightboxIdx: number | null; setLightboxIdx: (n: number | null) => void }) {
  return (
    <div className="p-4 pb-8">
      <div className="grid grid-cols-2 gap-2.5">
        {images.map((src, i) => (
          <button key={i} onClick={() => setLightboxIdx(i)} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 aspect-[4/3]">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          idx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(lightboxIdx > 0 ? lightboxIdx - 1 : images.length - 1)}
          onNext={() => setLightboxIdx(lightboxIdx < images.length - 1 ? lightboxIdx + 1 : 0)}
        />
      )}
    </div>
  );
}

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────
function Lightbox({ images, idx, onClose, onPrev, onNext }: { images: string[]; idx: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl">
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition">✕</button>
        <span className="text-xs font-medium tracking-widest uppercase text-white/70">{idx + 1} / {images.length}</span>
        <span className="h-9 w-9" />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8 relative">
        <button onClick={onPrev} className="absolute left-3 md:left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition z-10">‹</button>
        <img src={images[idx]} alt="" className="max-h-[78vh] max-w-[92vw] rounded-[12px] object-contain shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-[fadeIn_0.4s_ease]" style={{ animation: "fadeIn 0.4s ease" }} />
        <button onClick={onNext} className="absolute right-3 md:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition z-10">›</button>
      </div>
      <div className="flex justify-center gap-2 pb-6">
        {images.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1 bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── DESKTOP MUSIC ─────────────────────────────────────────────────────────
function DesktopMusic(props: {
  tracks: MusicTrack[];
  idx: number;
  setIdx: (n: number) => void;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  volume: number;
  setVolume: (n: number) => void;
  isMuted: boolean;
  setIsMuted: (b: boolean) => void;
  setCurrentTime: (n: number) => void;
}) {
  const { tracks, idx, setIdx, isPlaying, setIsPlaying, currentTime, duration, volume, setVolume, isMuted, setIsMuted } = props;
  const track = tracks[idx];

  const fmt = (s: number) => {
    if (!isFinite(s) || s === 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (props.audioRef.current) {
      props.audioRef.current.currentTime = v;
      props.setCurrentTime(v);
    }
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col md:flex-row">
      {/* Left: artwork + controls */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#fdfcf8] to-[#f2f0ea] p-6 md:p-8">
        <div className="relative w-full max-w-[300px]">
          <div className="aspect-square overflow-hidden rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 bg-white">
            <img src={track.cover} alt={track.title} className={`h-full w-full object-cover transition duration-700 ${isPlaying ? "scale-[1.02]" : "scale-100"}`} />
            {/* vinyl center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/80 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
              <span className={`h-2 w-2 rounded-full bg-white ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
          </div>
          {/* floating badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#111] px-4 py-2 shadow-lg">
            <span className={`h-2 w-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-white/40"}`} />
            <span className="text-xs font-semibold tracking-wide text-white uppercase">{isPlaying ? "Playing" : "Paused"}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111]" style={{ fontFamily: "Instrument Serif, serif" }}>{track.title}</h3>
          <p className="mt-1 text-sm font-medium text-black/50">{track.artist}</p>
          <p className="mt-1 text-xs font-medium tracking-wide text-black/30 uppercase">{String(idx + 1).padStart(2, "0")} of {tracks.length} · {track.duration}</p>
        </div>

        {/* Controls */}
        <div className="mt-6 w-full max-w-[360px]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-black/40 w-10 text-right">{fmt(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={seek}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, #111 0%, #111 ${(currentTime / (duration || 1)) * 100}%, rgba(0,0,0,0.08) ${(currentTime / (duration || 1)) * 100}%, rgba(0,0,0,0.08) 100%)`,
                height: "3px",
                borderRadius: "999px",
              }}
            />
            <span className="text-xs font-medium tabular-nums text-black/40 w-10">{fmt(duration)}</span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setIdx(idx > 0 ? idx - 1 : tracks.length - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/10 text-[#111] hover:bg-zinc-50 transition active:scale-95"
              aria-label="Previous"
            >
              ⏮
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-black transition active:scale-95"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="text-lg ml-0.5">{isPlaying ? "❚❚" : "▶"}</span>
            </button>
            <button
              onClick={() => setIdx(idx < tracks.length - 1 ? idx + 1 : 0)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/10 text-[#111] hover:bg-zinc-50 transition active:scale-95"
              aria-label="Next"
            >
              ⏭
            </button>
          </div>

          {/* Volume */}
          <div className="mt-6 flex items-center gap-3 rounded-full bg-white px-4 py-2.5 ring-1 ring-black/5 shadow-sm">
            <button onClick={() => setIsMuted(!isMuted)} className="text-sm text-black/60 hover:text-black transition w-6">{isMuted ? "🔇" : "🔊"}</button>
            <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="flex-1" />
            <span className="text-xs font-medium text-black/40 w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>

          <p className="mt-4 text-center text-[11px] font-medium text-black/30">Music never autoplays — press play to begin.</p>
        </div>
      </div>

      {/* Right: playlist */}
      <div className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-black/5 bg-white flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-black/5">
          <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-black/50">Playlist</h4>
          <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">{tracks.length} tracks</span>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {tracks.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setIdx(i);
                setIsPlaying(true);
              }}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${i === idx ? "bg-[#111] text-white shadow" : "hover:bg-black/5 text-[#111]"}`}
            >
              <img src={t.cover} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold leading-tight truncate ${i === idx ? "text-white" : "text-[#111]"}`}>{t.title}</p>
                <p className={`text-xs truncate ${i === idx ? "text-white/70" : "text-black/50"}`}>{t.artist} · {t.duration}</p>
              </div>
              {i === idx && isPlaying ? (
                <span className="flex gap-0.5 items-end h-4">
                  <span className="w-0.5 h-3 bg-white animate-[bar_0.6s_ease_infinite]" />
                  <span className="w-0.5 h-4 bg-white animate-[bar_0.7s_ease_infinite_0.1s]" />
                  <span className="w-0.5 h-2 bg-white animate-[bar_0.5s_ease_infinite_0.2s]" />
                </span>
              ) : (
                <span className={`text-xs ${i === idx ? "text-white/50" : "text-black/30"}`}>▶</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-black/5">
          <p className="text-[11px] font-medium leading-relaxed text-black/40 text-center">Add songs in <code className="bg-black/5 px-1 rounded">src/config/musicTracks.js</code> — just drop the file and update the path.</p>
        </div>
      </div>

      <style>{`@keyframes bar{0%,100%{height:4px}50%{height:14px}} @keyframes fadeIn{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function MobileMusic(props: {
  tracks: MusicTrack[];
  idx: number;
  setIdx: (n: number) => void;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  volume: number;
  setVolume: (n: number) => void;
  isMuted: boolean;
  setIsMuted: (b: boolean) => void;
  setCurrentTime: (n: number) => void;
}) {
  const { tracks, idx, setIdx, isPlaying, setIsPlaying, currentTime, duration, volume, setVolume, isMuted, setIsMuted } = props;
  const track = tracks[idx];
  const fmt = (s: number) => {
    if (!isFinite(s) || s === 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (props.audioRef.current) {
      props.audioRef.current.currentTime = v;
      props.setCurrentTime(v);
    }
  };

  return (
    <div className="flex flex-col pb-8">
      <div className="px-6 pt-6 flex flex-col items-center">
        <div className="w-full max-w-[300px] aspect-square rounded-[24px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.16)] ring-1 ring-black/5 relative bg-white">
          <img src={track.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-[#111]">{track.artist}</span>
            <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">{String(idx + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}</span>
          </div>
        </div>
        <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-[#111]" style={{ fontFamily: "Instrument Serif, serif" }}>{track.title}</h3>
        <p className="text-sm font-medium text-black/50">{track.artist}</p>

        <div className="mt-6 w-full max-w-[360px]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-black/40 w-10 text-right">{fmt(currentTime)}</span>
            <input type="range" min={0} max={duration || 100} value={currentTime} onChange={seek} className="flex-1" />
            <span className="text-xs font-medium tabular-nums text-black/40 w-10">{fmt(duration)}</span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => setIdx(idx > 0 ? idx - 1 : tracks.length - 1)} className="h-12 w-12 rounded-full bg-white ring-1 ring-black/10 flex items-center justify-center text-[#111]">⏮</button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="h-16 w-16 rounded-full bg-[#111] text-white flex items-center justify-center shadow-lg text-xl">{isPlaying ? "❚❚" : "▶"}</button>
            <button onClick={() => setIdx(idx < tracks.length - 1 ? idx + 1 : 0)} className="h-12 w-12 rounded-full bg-white ring-1 ring-black/10 flex items-center justify-center text-[#111]">⏭</button>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-full bg-white px-4 py-3 ring-1 ring-black/5 shadow-sm">
            <button onClick={() => setIsMuted(!isMuted)} className="text-sm">{isMuted ? "🔇" : "🔊"}</button>
            <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="mt-8 px-4">
        <p className="px-2 text-xs font-semibold tracking-[0.1em] uppercase text-black/40">Up Next</p>
        <div className="mt-3 space-y-2">
          {tracks.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setIdx(i); setIsPlaying(true); }}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${i === idx ? "bg-[#111] text-white" : "bg-white ring-1 ring-black/5 text-[#111]"}`}
            >
              <img src={t.cover} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${i === idx ? "text-white" : "text-[#111]"}`}>{t.title}</p>
                <p className={`text-xs truncate ${i === idx ? "text-white/70" : "text-black/50"}`}>{t.artist}</p>
              </div>
              <span className="text-xs opacity-60">{i === idx && isPlaying ? "●" : "▶"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
