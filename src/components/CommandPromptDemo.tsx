/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Sparkles, Terminal, CheckCircle2, ArrowRight } from "lucide-react";

interface CommandPromptDemoProps {
  onNotify?: (msg: string) => void;
}

const SAMPLE_SUGGESTIONS = [
  "Make this travel reel cinematic and fast-paced.",
  "Apply a moody teal & orange grade with speed ramps.",
  "Auto-crop clip to 9:16 vertical focus on the snowboarder.",
  "Beat-sync transitions perfectly to the bass synth drop.",
];

export default function CommandPromptDemo({ onNotify }: CommandPromptDemoProps) {
  const [inputText, setInputText] = useState("Make this travel reel cinematic and fast-paced.");
  const [isTyping, setIsTyping] = useState(false);
  const [pipelineState, setPipelineState] = useState<"idle" | "processing" | "complete">("idle");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 for split screen
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pipelineSteps = [
    "Acoustic scanning: analyzing transient peaks...",
    "Subject detection: mapping 9:16 focal center vectors...",
    "Grading: applying Teal & Orange 3D LUT profile...",
    "Compilation: rendering micro-cuts onto timeline tracks...",
  ];

  // Typing simulator
  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping || pipelineState === "processing") return;
    setIsTyping(true);
    setInputText("");
    setPipelineState("idle");

    let currentText = "";
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < suggestion.length) {
        currentText += suggestion[charIndex];
        setInputText(currentText);
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
  };

  const handleExecutePrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText || isTyping || pipelineState === "processing") return;

    setPipelineState("processing");
    setPipelineStep(0);

    if (onNotify) {
      onNotify(`Prompt accepted: "${inputText}"`);
    }
  };

  // Run the processing pipeline step-by-step
  useEffect(() => {
    if (pipelineState !== "processing") return;

    const interval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev < pipelineSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setPipelineState("complete");
          if (onNotify) {
            onNotify("AI Video Edit rendered successfully.");
          }
          // Shift slider position to show the difference
          setSliderPosition(20);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [pipelineState]);

  // Handle Drag / Move of Before-After Slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div id="command-prompt-component" className="glass-panel rounded-2xl p-0 md:col-span-8 relative overflow-hidden flex flex-col lg:flex-row bg-[#010204]/40 group border border-white/10">
      {/* Glow path */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D8FF] to-transparent opacity-50" />

      {/* Text Controls Panel */}
      <div className="flex-1 p-6 sm:p-8 z-10 relative flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#00D8FF] font-bold">
              Natural Language Editing
            </span>
            <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Command Prompt
            </h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-sm">
              Describe the vibe. ShotNode selects clips, applies color LUT profiles, and maps timeline pacing instantly.
            </p>
          </div>

          {/* Interactive Console Terminal */}
          <form onSubmit={handleExecutePrompt} className="space-y-3">
            <div className="bg-[#02060C] border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] focus-within:border-[#147CFF] transition-all">
              <Terminal className="w-4 h-4 text-[#147CFF] flex-shrink-0" />
              <input
                id="prompt-input-field"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping || pipelineState === "processing"}
                placeholder="Describe your desired edits..."
                className="bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none flex-1 font-mono"
              />
              <button
                id="execute-prompt-btn"
                type="submit"
                disabled={isTyping || pipelineState === "processing"}
                className="p-1.5 rounded-lg bg-[#147CFF]/15 hover:bg-[#147CFF]/30 text-[#00D8FF] transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pipeline Status display */}
            {pipelineState === "processing" && (
              <div className="bg-[#010204] border border-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#00D8FF]">
                  <span className="font-semibold uppercase tracking-wider">AI Operations Node</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                    <span>Processing...</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-gray-300">
                  <span className="text-[#147CFF]">&gt;</span> {pipelineSteps[pipelineStep]}
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((pipelineStep + 1) / pipelineSteps.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#147CFF] to-[#00D8FF] transition-all duration-500"
                  />
                </div>
              </div>
            )}

            {pipelineState === "complete" && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-400">
                  Sequence compiled successfully. Look at the slider!
                </span>
                <button
                  id="reset-pipeline-btn"
                  type="button"
                  onClick={() => {
                    setPipelineState("idle");
                    setSliderPosition(50);
                  }}
                  className="ml-auto text-[10px] font-mono underline text-gray-400 hover:text-white"
                >
                  Reset
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Suggestion Bubbles */}
        <div className="pt-6 border-t border-white/5 mt-6">
          <label className="text-[10px] font-mono tracking-wider text-on-surface-variant uppercase block mb-2.5">
            Suggested Prompts
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SUGGESTIONS.map((suggestion) => (
              <button
                id={`suggest-btn-${suggestion.substring(0, 10).toLowerCase().replace(/[^a-z]/g, "")}`}
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[11px] font-medium text-on-surface-variant bg-white/5 border border-white/5 hover:border-[#147CFF]/40 hover:text-white px-2.5 py-1.5 rounded-lg transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Visual Split Slider Panel */}
      <div
        id="split-image-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="flex-1 min-h-[300px] lg:h-full relative overflow-hidden select-none cursor-ew-resize border-t lg:border-t-0 lg:border-l border-white/10"
      >
        {/* Background / Right Image: "After" AI Edit (Teal and Orange LUT) */}
        <div className="absolute inset-0">
          <img
            alt="After AI Edit"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMHHrh0rKJAToUj3Bj3DhQ2EY7plzvZJx5x1vOj5hMzflRvSJdogD9gLI4OcdS0xUm_S9gShD69Jd4xdkR5yRTZOns-e2FcmQGDKCsNwGUdkLCUphi0260OKpsZJAII3tImDLDjKe2wwK0p4N9I9xj2owIBfKqbnvXFgHWC8ExLfzmIE3ZdzdJf1SCQQuaQvjsEqBV5rgNxZ70LCL61thKreYGKH7KXmXNmReumSRrlivtCvXLMOW7pCGaWmSZFrsIKQAWlXHRm1tJ"
            className="w-full h-full object-cover filter contrast-125 saturate-150 brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <span className="absolute bottom-4 right-4 bg-[#00D8FF]/20 border border-[#00D8FF]/30 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white font-semibold uppercase tracking-wider">
            After Edit
          </span>
        </div>

        {/* Foreground / Left Image: "Before" AI Edit (Original raw flat log style) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#147CFF]"
        >
          <img
            alt="Before AI Edit"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMHHrh0rKJAToUj3Bj3DhQ2EY7plzvZJx5x1vOj5hMzflRvSJdogD9gLI4OcdS0xUm_S9gShD69Jd4xdkR5yRTZOns-e2FcmQGDKCsNwGUdkLCUphi0260OKpsZJAII3tImDLDjKe2wwK0p4N9I9xj2owIBfKqbnvXFgHWC8ExLfzmIE3ZdzdJf1SCQQuaQvjsEqBV5rgNxZ70LCL61thKreYGKH7KXmXNmReumSRrlivtCvXLMOW7pCGaWmSZFrsIKQAWlXHRm1tJ"
            className="absolute inset-y-0 left-0 w-full h-full object-cover filter saturate-50 contrast-85 brightness-110 sepia-[5%]"
            style={{ width: containerRef.current?.getBoundingClientRect().width || "500px", maxWidth: "none" }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-4 bg-black/60 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
            Raw Clip Log
          </span>
        </div>

        {/* Slider Handle Node with Pulse Glow */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute inset-y-0 w-1 flex items-center justify-center pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#147CFF] border border-[#00D8FF] shadow-[0_0_15px_rgba(20,124,255,0.6)] flex items-center justify-center text-white cursor-ew-resize">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
