import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, Sliders, Radio, Activity } from 'lucide-react';

const TRACKS = [
  { id: '1', title: "NEON HORIZON", artist: "DJ CYBER // MIX", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", color: "from-cyan-400 to-blue-600", shadow: "shadow-cyan-500/50" },
  { id: '2', title: "SYNTHETIC DREAMS", artist: "VIRTUAL_RIOT", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color: "from-fuchsia-400 to-purple-600", shadow: "shadow-fuchsia-500/50" },
  { id: '3', title: "QUANTUM BASS", artist: "NEXUS_PRIME", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", color: "from-emerald-400 to-teal-600", shadow: "shadow-emerald-500/50" },
  { id: '4', title: "SOLAR FLARE", artist: "DJ ASTRAL", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", color: "from-amber-400 to-orange-600", shadow: "shadow-amber-500/50" }
];

const PAD_COLORS = [
  'bg-cyan-400 shadow-cyan-400/50', 'bg-fuchsia-400 shadow-fuchsia-400/50', 'bg-emerald-400 shadow-emerald-400/50', 'bg-amber-400 shadow-amber-400/50',
  'bg-purple-400 shadow-purple-400/50', 'bg-blue-400 shadow-blue-400/50', 'bg-pink-400 shadow-pink-400/50', 'bg-lime-400 shadow-lime-400/50',
  'bg-rose-400 shadow-rose-400/50', 'bg-indigo-400 shadow-indigo-400/50', 'bg-teal-400 shadow-teal-400/50', 'bg-yellow-400 shadow-yellow-400/50'
];

export default function App() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Visualizer State
  const [bars, setBars] = useState<number[]>(Array(24).fill(10));
  const animationRef = useRef<number>();

  // DJ Pads State
  const [activePads, setActivePads] = useState<Set<number>>(new Set());

  // Handle Audio Playback
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (direction: 1 | -1) => {
    let next = currentTrack + direction;
    if (next >= TRACKS.length) next = 0;
    if (next < 0) next = TRACKS.length - 1;
    setCurrentTrack(next);
    setProgress(0);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 50);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) setProgress((current / duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  // Simulated Visualizer Loop
  useEffect(() => {
    const updateVisualizer = () => {
      if (isPlaying) {
        setBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
      } else {
        setBars(prev => prev.map(h => Math.max(10, h - 5))); // Smooth decay
      }
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(updateVisualizer, 80); // Throttle for beat effect
      });
    };
    animationRef.current = requestAnimationFrame(updateVisualizer);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [isPlaying]);

  // Handle DJ Pad Click
  const triggerPad = (index: number) => {
    setActivePads(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    
    // Simulate a beat jump or effect
    if (audioRef.current && isPlaying) {
      // Small random pitch shift or volume duck for "DJ effect" feel
      const originalVol = audioRef.current.volume;
      audioRef.current.volume = Math.max(0, originalVol - 0.3);
      setTimeout(() => {
        if (audioRef.current) audioRef.current.volume = originalVol;
      }, 150);
    }

    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 200);
  };

  const track = TRACKS[currentTrack];

  return (
    <div className="min-h-screen bg-luxury-gradient text-purple-50 font-sans flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className={`absolute top-[20%] right-[20%] w-[30%] h-[30%] ${track.color.split(' ')[0].replace('from-', 'bg-')}/10 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000`}></div>

      {/* Header */}
      <header className="mb-8 text-center z-10 w-full relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-widest glow-text flex items-center justify-center gap-4">
          <Radio className="text-fuchsia-400 animate-pulse" size={40} />
          <span className="shake-multicolor">NEON SNAKES AND BEATS</span>
        </h1>
        <div className="h-[1px] w-64 mx-auto mt-4 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-50"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl z-10">
        
        {/* BOX 1: THE DECK (Player Controls) */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between aspect-square lg:aspect-auto lg:h-[520px] relative overflow-hidden group">
          <div className="w-full flex justify-between items-center mb-4 z-10">
            <h2 className="text-sm font-medium tracking-widest text-purple-200 flex items-center gap-2">
              <Disc size={16} className="text-cyan-400" /> DECK A
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/20">
              {isPlaying ? 'LIVE' : 'SYNC'}
            </span>
          </div>

          {/* Vinyl / Album Art */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 my-auto flex items-center justify-center z-10">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${track.color} opacity-20 blur-xl transition-all duration-500 ${isPlaying ? 'scale-110' : 'scale-90'}`}></div>
            <div className={`w-full h-full rounded-full border-4 border-purple-900/50 bg-black/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
              {/* Record Grooves */}
              <div className="absolute inset-2 rounded-full border border-white/5"></div>
              <div className="absolute inset-6 rounded-full border border-white/5"></div>
              <div className="absolute inset-10 rounded-full border border-white/5"></div>
              {/* Center Label */}
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${track.color} flex items-center justify-center shadow-inner`}>
                <div className="w-4 h-4 bg-black rounded-full border-2 border-white/20"></div>
              </div>
            </div>
          </div>

          {/* Track Info & Controls */}
          <div className="w-full mt-4 z-10">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide truncate">{track.title}</h3>
              <p className="text-sm text-purple-300 tracking-widest mt-1 truncate">{track.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-purple-900/50 rounded-full mb-6 overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${track.color} transition-all duration-100`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => skipTrack(-1)} className="text-purple-300 hover:text-white transition-colors">
                <SkipBack size={24} />
              </button>
              <button 
                onClick={togglePlay} 
                className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${track.color} text-white shadow-lg ${track.shadow} hover:scale-105 transition-all`}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => skipTrack(1)} className="text-purple-300 hover:text-white transition-colors">
                <SkipForward size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* BOX 2: THE VISUALIZER (Colorful Beats) */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between aspect-square lg:aspect-auto lg:h-[520px] relative">
          <div className="w-full flex justify-between items-center mb-4 z-10">
            <h2 className="text-sm font-medium tracking-widest text-purple-200 flex items-center gap-2">
              <Activity size={16} className="text-fuchsia-400" /> SPECTRUM
            </h2>
          </div>

          <div className="flex-1 w-full flex items-end justify-between gap-1 md:gap-2 pb-8 pt-12 relative z-10">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-8">
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
            </div>

            {/* Bars */}
            {bars.map((height, i) => {
              // Create a rainbow gradient effect across the bars
              const hue = (i / bars.length) * 360;
              return (
                <div 
                  key={i} 
                  className="w-full rounded-t-sm transition-all duration-75 ease-out relative group"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: `hsl(${hue}, 80%, 60%)`,
                    boxShadow: isPlaying ? `0 0 15px hsl(${hue}, 80%, 60%, 0.5)` : 'none'
                  }}
                >
                  <div className="absolute -top-2 left-0 w-full h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="w-full flex items-center gap-4 bg-purple-900/30 p-3 rounded-xl border border-purple-500/20 z-10">
            <Volume2 size={18} className="text-purple-300" />
            <input 
              type="range" 
              min="0" max="100" 
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
            />
          </div>
        </div>

        {/* BOX 3: DJ MIXER PADS */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between aspect-square lg:aspect-auto lg:h-[520px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium tracking-widest text-purple-200 flex items-center gap-2">
              <Sliders size={16} className="text-emerald-400" /> FX PADS
            </h2>
          </div>

          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 w-full">
              {PAD_COLORS.map((colorClass, i) => {
                const isActive = activePads.has(i);
                // Extract base color for the glow
                const baseColor = colorClass.split(' ')[0].replace('bg-', '');
                
                return (
                  <button
                    key={i}
                    onMouseDown={() => triggerPad(i)}
                    onTouchStart={(e) => { e.preventDefault(); triggerPad(i); }}
                    className={`aspect-square rounded-xl transition-all duration-100 relative overflow-hidden border border-white/10
                      ${isActive 
                        ? `${colorClass} scale-95 brightness-150` 
                        : 'bg-purple-900/40 hover:bg-purple-800/60 hover:border-white/20'
                      }
                    `}
                  >
                    {/* Inner glow ring */}
                    <div className={`absolute inset-1 rounded-lg border border-white/20 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                    
                    {/* Idle state colored dot */}
                    {!isActive && (
                      <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full bg-${baseColor} opacity-50`}></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mixer Knobs (Decorative) */}
            <div className="flex justify-between items-center mt-8 px-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center shadow-inner relative">
                    <div className="w-1 h-3 bg-cyan-400 absolute top-1 rounded-full" style={{ transform: `rotate(${Math.random() * 120 - 60}deg)`, transformOrigin: 'bottom center' }}></div>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">CH {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <audio
        ref={audioRef}
        src={track.url}
        onEnded={() => skipTrack(1)}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
    </div>
  );
}
