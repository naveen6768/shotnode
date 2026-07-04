/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, Waves, Crop, Subtitles, Activity, HelpCircle } from "lucide-react";

export default function EditorPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeNodes, setActiveNodes] = useState({
    beatSync: true,
    smartReframe: true,
    autoCaptions: true,
    motionDna: false,
  });
  const [timelineSec, setTimelineSec] = useState(0);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimelineSec((prev) => {
        const next = prev + 0.1;
        return next >= 10 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleNode = (node: keyof typeof activeNodes) => {
    setActiveNodes((prev) => ({
      ...prev,
      [node]: !prev[node],
    }));
  };

  return (
    <div id="editor-mockup-interactive" className="relative h-[550px] w-full perspective-1000 z-10">
      {/* Soft screen glow illuminating the dark space */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#147CFF]/30 to-[#00D8FF]/10 blur-[100px] rounded-full pointer-events-none opacity-80" />

      {/* Editor Mockup Canvas Frame */}
      <div className="absolute inset-0 glass-modal rounded-2xl transform lg:rotate-y-[-8deg] lg:rotate-x-[4deg] lg:hover:rotate-y-0 lg:hover:rotate-x-0 scale-95 hover:scale-100 transition-all duration-700 flex flex-col justify-between overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
        {/* Background sample mockup representation */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0nT6fkWtiF-Xp0qo_uOwtmhjcMq9qnyYPT7o3gvwwbL5i7cBSijVDCcRoJQwQJUlaDR4GLP6JncMBPPW61DK4Eg02v315YxU3Rlq7yaNXUNm-MqmRK6M-rUXDvloC7IuzYruene0Nju41AN-04L0C8ObJPCSpZbrtyb0lTUuJympKPTCTTJxaeQIgd7YgAUKOkghRzy7TGLfV8A_BrRXwEpk8jJ-ahXEpLRn9iWFi8UQw5MlNuk2tFWisUU3ZQLUaFbW5dmJDKSia')`,
          }}
        />

        {/* Top Control Bar inside mockup */}
        <div className="p-3 bg-black/60 border-b border-white/5 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D8FF] animate-pulse" />
            <span className="font-mono text-[9px] text-[#00D8FF] font-bold uppercase tracking-widest">
              Live Rendering
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-400">
            00:0{timelineSec.toFixed(1)} / 00:10.0
          </span>
        </div>

        {/* Live overlay elements mimicking the selected options */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Wave ripple representing active beat sync */}
          {activeNodes.beatSync && isPlaying && (
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute w-48 h-48 border border-[#00D8FF]/40 rounded-full"
            />
          )}

          {/* Focal tracking box representing Smart Reframe */}
          {activeNodes.smartReframe && (
            <div className="absolute w-32 h-32 border-2 border-dashed border-[#147CFF] rounded-lg flex items-center justify-center">
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
              <span className="text-[9px] font-mono text-[#00D8FF] uppercase tracking-wider bg-black/75 px-1 rounded">
                Focus Lock
              </span>
            </div>
          )}

          {/* Captions Overlay representation */}
          {activeNodes.autoCaptions && isPlaying && (
            <div className="absolute bottom-16 left-4 right-4 text-center">
              <p className="inline-block bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[10px] font-medium text-white max-w-[180px] truncate shadow-lg">
                💬 {timelineSec < 3.3 ? "Analyzing sound waveform..." : timelineSec < 6.6 ? "Auto synchronization complete!" : "Ready to render 4K ProRes."}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Play Controller at center */}
        <button
          id="preview-play-toggle"
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-[#147CFF]/20 hover:border-[#00D8FF] transition-all flex items-center justify-center z-20 text-white cursor-pointer shadow-xl backdrop-blur-md"
        >
          {isPlaying ? <Pause className="w-5 h-5 text-[#00D8FF]" /> : <Play className="w-5 h-5 text-white fill-white" />}
        </button>

        {/* Floating Interactive Controller Nodes outside the screen but connected via styling */}
        {/* Node 1: Beat Sync Active */}
        <div className="absolute top-1/4 left-6 z-20 pointer-events-auto">
          <button
            id="node-toggle-beatsync"
            onClick={() => toggleNode("beatSync")}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-lg ${
              activeNodes.beatSync
                ? "border-[#00D8FF] bg-[#02060C]/90 text-white shadow-[#00D8FF]/10"
                : "border-white/10 bg-[#02060C]/60 text-gray-500"
            }`}
          >
            <Waves className={`w-3.5 h-3.5 ${activeNodes.beatSync ? "text-[#00D8FF]" : "text-gray-500"}`} />
            <span>Beat Sync Active</span>
          </button>
        </div>

        {/* Node 2: Smart Reframe */}
        <div className="absolute bottom-1/3 right-6 z-20 pointer-events-auto">
          <button
            id="node-toggle-reframe"
            onClick={() => toggleNode("smartReframe")}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-lg ${
              activeNodes.smartReframe
                ? "border-[#147CFF] bg-[#02060C]/90 text-white shadow-[#147CFF]/10"
                : "border-white/10 bg-[#02060C]/60 text-gray-500"
            }`}
          >
            <Crop className={`w-3.5 h-3.5 ${activeNodes.smartReframe ? "text-[#147CFF]" : "text-gray-500"}`} />
            <span>Smart Reframe</span>
          </button>
        </div>

        {/* Node 3: Auto Captions */}
        <div className="absolute top-[15%] right-8 z-20 pointer-events-auto">
          <button
            id="node-toggle-captions"
            onClick={() => toggleNode("autoCaptions")}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-lg ${
              activeNodes.autoCaptions
                ? "border-[#00D8FF] bg-[#02060C]/90 text-white shadow-[#00D8FF]/10"
                : "border-white/10 bg-[#02060C]/60 text-gray-500"
            }`}
          >
            <Subtitles className={`w-3.5 h-3.5 ${activeNodes.autoCaptions ? "text-[#00D8FF]" : "text-gray-500"}`} />
            <span>Auto Captions</span>
          </button>
        </div>

        {/* Node 4: Motion DNA */}
        <div className="absolute bottom-1/4 left-8 z-20 pointer-events-auto">
          <button
            id="node-toggle-motion"
            onClick={() => toggleNode("motionDna")}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-lg ${
              activeNodes.motionDna
                ? "border-[#147CFF] bg-[#02060C]/90 text-white shadow-[#147CFF]/10"
                : "border-white/10 bg-[#02060C]/60 text-gray-500"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeNodes.motionDna ? "text-[#147CFF]" : "text-gray-500"}`} />
            <span>Motion DNA</span>
          </button>
        </div>

        {/* Simulated Timeline Track indicators at bottom */}
        <div className="p-4 bg-black/80 border-t border-white/5 z-10 space-y-2">
          {/* Horizontal progress meter */}
          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              style={{ width: `${(timelineSec / 10) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#147CFF] to-[#00D8FF]"
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest">
            <span>Video Track 01</span>
            <span>00:10.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
