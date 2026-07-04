/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { FAQItem } from "../types";

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "q1",
    question: "How does ShotNode's AI Beat Syncing technology work?",
    answer: "ShotNode features a high-performance deep acoustic engine that scans audio files to map transient waves, baseline beats, and key audio drops. It then aligns visual edits and clip transitions precisely with those timestamps automatically, delivering professionally paced cinematic loops in seconds.",
  },
  {
    id: "q2",
    question: "Which export codecs and dimensions are supported?",
    answer: "Our Free plan supports up to 720p H.264 standard exports. Creator Pro expands this to include full 4K ProRes 422/4444 and high-fidelity HEVC, perfect for pro editors. You can render widescreen 16:9, vertical 9:16, or square 1:1 format outputs in parallel.",
  },
  {
    id: "q3",
    question: "Can I import custom LUT color files and camera assets?",
    answer: "Absolutely. Creator Pro and Studio plan tiers allow you to drag and drop custom 3D LUT files (.cube format) to keep color grading consistent across your projects, alongside our proprietary smart stylistic color filters.",
  },
  {
    id: "q4",
    question: "Is there an offline mobile or desktop version available?",
    answer: "Yes, ShotNode is available as a web portal, a macOS/Windows desktop shell for heavy workstation rendering, and our Android/iOS native apps which feature full hardware-accelerated timeline previews.",
  },
  {
    id: "q5",
    question: "How does the Command Prompt AI process natural language instructions?",
    answer: "We use high-context LLM models server-side to interpret creative prompts like 'Make it energetic with dramatic cinematic color grading' into functional instructions: selecting the fastest b-rolls, applying high-contrast LUTs, accelerating keyframes, and matching cuts to acoustic drop frames.",
  },
];

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq-section" className="py-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto relative border-t border-white/5">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#147CFF]/5 border border-[#147CFF]/15 text-xs font-mono text-[#00D8FF] uppercase tracking-widest">
          <HelpCircle className="w-3.5 h-3.5" />
          General FAQ
        </div>
        <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Frequently Answered Inquiries
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base max-w-lg mx-auto">
          Learn how ShotNode combines machine learning with technical timeline orchestration.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden hover:border-white/10 transition-all duration-300"
            >
              <button
                id={`faq-btn-${item.id}`}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between p-6 text-left text-white focus:outline-none focus:bg-white/[0.02]"
              >
                <span className="font-sans font-semibold text-base sm:text-lg tracking-tight pr-4">
                  {item.question}
                </span>
                <span className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant group-hover:text-white">
                  {isOpen ? <Minus className="w-4 h-4 text-[#00D8FF]" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 text-on-surface-variant text-sm leading-relaxed border-t border-white/[0.03] bg-black/20">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
