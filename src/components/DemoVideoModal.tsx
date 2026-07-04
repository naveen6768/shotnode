/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Play, Pause, RefreshCw, Layers, Crop, Film, Sliders, Volume2, Sparkles, Check } from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_CLIPS = [
  {
    id: "alpine",
    title: "Alpine Descent - Gnar Extreme",
    url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800",
    color: "from-blue-600/30 to-cyan-500/30",
    beats: [1.2, 2.4, 3.6, 4.8, 6.0, 7.2, 8.4, 9.6],
    vibes: "Fast-paced adrenaline sports",
  },
  {
    id: "cyberpunk",
    title: "Tokyo Neon Streets - Cyberpunk Vibe",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=800",
    color: "from-purple-600/30 to-pink-500/30",
    beats: [0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4, 7.2],
    vibes: "Heavy bass retro synthesizer synthwave",
  },
  {
    id: "coastal",
    title: "Coastal Swell - Cinematic Drone",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    color: "from-emerald-600/30 to-teal-500/30",
    beats: [2.0, 4.0, 6.0, 8.0, 10.0],
    vibes: "Slow sweeping scenic ambience",
  },
];

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [activeClipIdx, setActiveClipIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [aspectRatio, setAspectRatio] = useState<"169" | "916">("169");
  const [lutFilter, setLutFilter] = useState<"none" | "tealOrange" | "noir" | "cyber">("tealOrange");
  const [aiTracking, setAiTracking] = useState(true);
  const [beatSync, setBeatSync] = useState(true);
  const [logs, setLogs] = useState<string[]>(["Initializing ShotNode Engine..."]);

  const activeClip = DEMO_CLIPS[activeClipIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto timeline progress simulation
  useEffect(() => {
    if (isPlaying && isOpen) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= 100) {
            // Trigger beat sync action logging
            addLog("Clip looping. Auto-adjusting timelines.");
            return 0;
          }

          // Generate periodic AI sync logs based on beats
          const currentSec = (next / 10).toFixed(1);
          const currentSecNum = parseFloat(currentSec);

          if (beatSync && activeClip.beats.some((b) => Math.abs(b - currentSecNum) < 0.05)) {
            addLog(`⚡ Audio Transient aligned at ${currentSec}s: Micro-cut executed.`);
          }

          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen, activeClipIdx, beatSync]);

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev.slice(0, 12)]);
  };

  const handleLutChange = (lut: typeof lutFilter) => {
    setLutFilter(lut);
    addLog(`Applied lookup table: ${lut.toUpperCase()} LUT grading`);
  };

  const handleAspectChange = (aspect: typeof aspectRatio) => {
    setAspectRatio(aspect);
    addLog(`Timeline profile: Converted structure to ${aspect === "169" ? "16:9 widescreen" : "9:16 portrait"}`);
    if (aspect === "916" && aiTracking) {
      addLog("🎯 Re-centering focal coordinates on main tracking subject.");
    }
  };

  const resetTimeline = () => {
    setProgress(0);
    setIsPlaying(true);
    addLog("Re-rendering sequence timeline.");
  };

  // Build the filter class based on active LUT
  const getFilterStyle = () => {
    switch (lutFilter) {
      case "tealOrange":
        return "contrast-125 saturate-150 sepia-[15%] hue-rotate-15 brightness-95 shadow-[inset_0_0_80px_rgba(20,124,255,0.25)]";
      case "noir":
        return "grayscale contrast-150 brightness-90";
      case "cyber":
        return "hue-rotate-180 contrast-125 saturate-200 hue-rotate-[180deg]";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="demo-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#010204]/90 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl h-[85vh] overflow-hidden rounded-2xl border border-white/10 glass-modal flex flex-col md:flex-row text-white z-10"
          >
            {/* Left Column: Simulated Video Player & Interactive Tools */}
            <div className="flex-1 flex flex-col bg-[#02060C] relative">
              {/* Floating Top Panel */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between z-10 bg-[#010204]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                    ShotNode Active Sandbox
                  </span>
                </div>
                <h3 className="text-sm font-semibold tracking-tight truncate max-w-xs">{activeClip.title}</h3>
              </div>

              {/* Main Player Display Window */}
              <div className="flex-1 flex items-center justify-center relative bg-[#000000] overflow-hidden">
                {/* Simulated Noise / Grid behind */}
                <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

                {/* Simulated Video Canvas */}
                <motion.div
                  animate={{
                    width: aspectRatio === "169" ? "100%" : "56.25%", // 9:16 aspect constraint
                    height: "100%",
                  }}
                  className="relative flex items-center justify-center transition-all overflow-hidden duration-500"
                >
                  <img
                    alt="Active Video Frame"
                    src={activeClip.url}
                    className={`w-full h-full object-cover select-none transition-all duration-300 ${getFilterStyle()}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient overlays */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${activeClip.color} mix-blend-overlay opacity-60`} />

                  {/* Smart Reframe Visual Target Ring */}
                  {aspectRatio === "916" && aiTracking && (
                    <motion.div
                      animate={{
                        x: [ -20, 20, -10, 15, 0 ],
                        y: [ -10, 10, -15, 5, 0 ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "easeInOut",
                      }}
                      className="absolute w-28 h-28 border-2 border-dashed border-[#00D8FF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,216,255,0.4)]"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#00D8FF]" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[8px] font-mono text-[#00D8FF] bg-black/60 px-1 rounded uppercase tracking-widest">
                        AI Focus Tracking
                      </div>
                    </motion.div>
                  )}

                  {/* Simulated Subtitle overlays when playing */}
                  {isPlaying && (
                    <div className="absolute bottom-12 left-6 right-6 text-center z-10 pointer-events-none">
                      <p className="inline-block bg-black/75 backdrop-blur-md text-xs sm:text-sm font-medium px-3.5 py-1.5 border border-white/10 rounded-lg shadow-xl tracking-wide max-w-sm">
                        {progress < 25 && "🎥 \"Let's sync up our primary clips with the kick drum...\""}
                        {progress >= 25 && progress < 50 && "⚡ Auto Beat-Syncing cuts: Match visuals to the transient baseline."}
                        {progress >= 50 && progress < 75 && "🎯 Dynamic Smart Reframe is currently maintaining target balance."}
                        {progress >= 75 && "🚀 Ready for immediate 4K ProRes rendering."}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Waveform and Playback Bar */}
              <div className="bg-[#010204] border-t border-white/5 p-4 space-y-4">
                {/* Horizontal Waveform with Progress Overlay */}
                <div className="relative h-14 bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                  {/* Generated mini waveforms */}
                  <div className="absolute inset-0 flex items-end justify-between px-2 py-1 gap-[2px]">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const waveH = Math.abs(Math.sin(i * 0.4) * 35) + Math.abs(Math.cos(i * 0.1) * 15) + 5;
                      const isBeating = activeClip.beats.some((b) => Math.abs(b - (i / 6)) < 0.15);
                      return (
                        <div
                          key={i}
                          style={{ height: `${waveH}%` }}
                          className={`w-[3px] rounded-full transition-colors duration-200 ${
                            i / 60 * 100 <= progress
                              ? isBeating && beatSync
                                ? "bg-[#00D8FF]"
                                : "bg-[#147CFF]"
                              : isBeating && beatSync
                              ? "bg-purple-500/40"
                              : "bg-white/15"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Timeline Cursor / Playhead */}
                  <div
                    style={{ left: `${progress}%` }}
                    className="absolute top-0 bottom-0 w-[2px] bg-[#00D8FF] shadow-[0_0_10px_#00D8FF] z-10 transition-all duration-100 ease-linear"
                  >
                    <div className="w-3 h-3 bg-[#00D8FF] rounded-full absolute -top-1.5 -left-1 shadow-[0_0_8px_#00D8FF]" />
                  </div>

                  {/* Time Stamps */}
                  <div className="absolute bottom-1 right-2 font-mono text-[9px] text-on-surface-variant z-10 bg-black/50 px-1 rounded">
                    00:0{(progress / 10).toFixed(1)} / 00:10.0
                  </div>
                </div>

                {/* Timeline Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      id="demo-play-toggle-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-[#00D8FF]" /> : <Play className="w-4 h-4 text-white fill-white" />}
                    </button>
                    <button
                      id="demo-refresh-btn"
                      onClick={resetTimeline}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-on-surface-variant" />
                    </button>
                  </div>

                  {/* Interactive toggle indicators */}
                  <div className="flex items-center gap-2">
                    <button
                      id="demo-beatsync-toggle-btn"
                      onClick={() => {
                        setBeatSync(!beatSync);
                        addLog(beatSync ? "Disabled beat-synchronized cuts." : "Activated precision beat-synchronization.");
                      }}
                      className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        beatSync
                          ? "border-[#00D8FF]/30 bg-[#00D8FF]/5 text-[#00D8FF]"
                          : "border-white/5 bg-white/5 text-on-surface-variant"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${beatSync ? "bg-[#00D8FF] animate-pulse" : "bg-gray-600"}`} />
                      Beat Sync
                    </button>

                    <button
                      id="demo-smartreframe-toggle-btn"
                      onClick={() => {
                        setAiTracking(!aiTracking);
                        addLog(aiTracking ? "Disabled AI focus tracking." : "Activated dynamic focal point tracking.");
                      }}
                      className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        aiTracking
                          ? "border-[#147CFF]/30 bg-[#147CFF]/5 text-[#147CFF]"
                          : "border-white/5 bg-white/5 text-on-surface-variant"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${aiTracking ? "bg-[#147CFF] animate-pulse" : "bg-gray-600"}`} />
                      Smart Reframe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Console Terminal & Config Options */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#010204]/95 flex flex-col justify-between">
              {/* Top Controls */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h4 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#147CFF]" />
                    Shot Controller
                  </h4>
                  <button
                    id="close-demo-modal-btn"
                    onClick={onClose}
                    className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Clip Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-on-surface-variant uppercase block">
                    Choose Sequence B-Roll
                  </label>
                  <div className="space-y-2">
                    {DEMO_CLIPS.map((clip, index) => {
                      const isSelected = activeClipIdx === index;
                      return (
                        <button
                          id={`clip-selector-btn-${clip.id}`}
                          key={clip.id}
                          onClick={() => {
                            setActiveClipIdx(index);
                            setProgress(0);
                            addLog(`Loaded clip: ${clip.title}`);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-[#00D8FF] bg-[#00D8FF]/5"
                              : "border-white/5 bg-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="w-10 h-10 rounded overflow-hidden relative border border-white/10 flex-shrink-0">
                            <img alt={clip.title} src={clip.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-on-surface-variant"}`}>
                              {clip.title}
                            </div>
                            <div className="text-[9px] font-mono text-gray-500 truncate">
                              {clip.vibes}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00D8FF] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Config */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-on-surface-variant uppercase block">
                    Render Layout Aspect
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="ratio-btn-169"
                      onClick={() => handleAspectChange("169")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        aspectRatio === "169"
                          ? "border-[#147CFF] bg-[#147CFF]/5 text-white"
                          : "border-white/5 bg-white/5 text-on-surface-variant hover:border-white/10"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      16:9 Wide
                    </button>
                    <button
                      id="ratio-btn-916"
                      onClick={() => handleAspectChange("916")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        aspectRatio === "916"
                          ? "border-[#147CFF] bg-[#147CFF]/5 text-white"
                          : "border-white/5 bg-white/5 text-on-surface-variant hover:border-white/10"
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                      9:16 Reels
                    </button>
                  </div>
                </div>

                {/* LUT Filter Settings */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-on-surface-variant uppercase block">
                    AI LUT Grading Filter
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "none", label: "Raw Grade" },
                      { id: "tealOrange", label: "Teal & Orange" },
                      { id: "noir", label: "Midnight Noir" },
                      { id: "cyber", label: "Acid Cyber" },
                    ].map((lut) => (
                      <button
                        id={`lut-filter-btn-${lut.id}`}
                        key={lut.id}
                        onClick={() => handleLutChange(lut.id as any)}
                        className={`p-2 rounded text-left text-[11px] font-medium border transition-all ${
                          lutFilter === lut.id
                            ? "border-[#00D8FF] bg-[#00D8FF]/5 text-white"
                            : "border-white/5 bg-white/5 text-on-surface-variant hover:border-white/10"
                        }`}
                      >
                        {lut.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom: Logs Terminal Console */}
              <div className="border-t border-white/10 p-4 h-40 flex flex-col bg-black/40">
                <div className="text-[9px] font-mono tracking-wider text-[#147CFF] uppercase mb-2 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#147CFF] animate-pulse" />
                  Terminal Log Feed
                </div>
                <div className="flex-1 font-mono text-[10px] text-gray-400 overflow-y-auto no-scrollbar space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className={`truncate ${index === 0 ? "text-emerald-400" : ""}`}>
                      <span className="text-gray-600">&gt;&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
