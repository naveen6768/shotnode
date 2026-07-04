/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Sparkles, CheckCircle2, Youtube, Instagram, Tv, ArrowRight } from "lucide-react";
import { WaitlistEnrollment } from "../types";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function WaitlistModal({ isOpen, onClose, defaultEmail = "" }: WaitlistModalProps) {
  const [email, setEmail] = useState(defaultEmail || "k.naveen6767@gmail.com");
  const [platform, setPlatform] = useState("youtube");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollment, setEnrollment] = useState<WaitlistEnrollment | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    // Simulate API registration delay
    setTimeout(() => {
      const queueNum = Math.floor(12400 + Math.random() * 5000);
      setEnrollment({
        email,
        platform,
        isRegistered: true,
        queueNumber: queueNum,
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="waitlist-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#010204]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-modal p-8 border border-[#147CFF]/30 text-white z-10"
          >
            {/* Corner ambient glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D8FF]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#147CFF]/20 blur-3xl rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              id="close-waitlist-btn"
              onClick={onClose}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {!enrollment ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="inline-flex p-3 bg-[#147CFF]/15 border border-[#147CFF]/30 rounded-xl mb-2 text-[#00D8FF]">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold tracking-tight">Join the Waitlist</h3>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                    Secure your spot for early beta access. Be the first to edit with AI precision.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-on-surface-variant uppercase mb-2">
                      Your Email Address
                    </label>
                    <input
                      id="waitlist-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@creator.com"
                      className="w-full bg-[#02060C] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#147CFF] focus:ring-1 focus:ring-[#147CFF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono tracking-wider text-on-surface-variant uppercase mb-2">
                      Primary Platform
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "youtube", icon: Youtube, label: "YT" },
                        { id: "instagram", icon: Instagram, label: "IG" },
                        { id: "tiktok", icon: Tv, label: "TikTok" },
                        { id: "other", icon: Sparkles, label: "Other" },
                      ].map((p) => {
                        const Icon = p.icon;
                        const isSelected = platform === p.id;
                        return (
                          <button
                            id={`platform-btn-${p.id}`}
                            key={p.id}
                            type="button"
                            onClick={() => setPlatform(p.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? "border-[#00D8FF] bg-[#00D8FF]/10 text-white"
                                : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20"
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="font-medium text-[10px]">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  id="submit-waitlist-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#147CFF] to-[#00D8FF] py-3.5 px-6 rounded-lg text-sm font-bold text-white hover:shadow-[0_0_25px_rgba(20,124,255,0.4)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Securing spot...</span>
                    </div>
                  ) : (
                    <>
                      <span>Secure Early Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="inline-flex p-4 bg-[#00D8FF]/10 border border-[#00D8FF]/30 rounded-full text-[#00D8FF] shadow-[0_0_20px_rgba(0,216,255,0.2)]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-sans text-2xl font-bold tracking-tight">You're on the list!</h3>
                  <p className="text-on-surface-variant text-sm">
                    Thank you for joining. We've registered <span className="text-white font-medium">{enrollment.email}</span>.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-10" />
                  <span className="text-xs font-mono tracking-wider text-on-surface-variant uppercase">
                    Your Queue Position
                  </span>
                  <div className="text-3xl font-mono font-bold text-[#00D8FF] tracking-wider glow-text">
                    #{enrollment.queueNumber}
                  </div>
                  <p className="text-[11px] text-on-surface-variant pt-2">
                    An email with beta configuration details will be sent to you as soon as servers spin up.
                  </p>
                </div>

                <button
                  id="close-success-waitlist-btn"
                  onClick={onClose}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg text-sm font-semibold text-white transition-colors"
                >
                  Close Panel
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
