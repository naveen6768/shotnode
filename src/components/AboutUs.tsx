/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Shield, Compass, Heart, Users, MapPin } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#010204] text-white font-sans bg-noise relative pt-24 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#147CFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D8FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        {/* Back Button and Title */}
        <div className="space-y-6">
          <Link
            id="about-back-btn"
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00D8FF] hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-[#147CFF]/40 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#147CFF]/10 border border-[#147CFF]/30">
              <span className="w-2 h-2 rounded-full bg-[#00D8FF]" />
              <span className="font-mono text-[10px] text-[#00D8FF] uppercase tracking-widest font-bold">
                Our Genesis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              About ShotNode AI
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed">
              We are on a mission to democratize cinematic video storytelling by replacing tedious technical friction with natural language intelligence.
            </p>
          </div>
        </div>

        {/* Corporate Entity Banner */}
        <div className="glass-modal rounded-2xl p-6 sm:p-8 border border-[#147CFF]/20 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 bg-noise opacity-10" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#00D8FF] uppercase tracking-widest font-semibold">
                Corporate Entity
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                SECONDBRAIN VENTURES PRIVATE LIMITED
              </h2>
              <p className="text-xs text-on-surface-variant">
                (Secondbrain Ventures pvt ltd)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/10">
              <MapPin className="w-4 h-4 text-[#00D8FF]" />
              <span>Noida, Uttar Pradesh</span>
            </div>
          </div>
        </div>

        {/* Brand Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-6 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#147CFF]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Our Vision</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Building the ultimate canvas where raw video clips flow seamlessly onto high-performance social sequences withzero manual tracking or manual timeline alignment.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00D8FF]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Our Standards</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We stand for architectural honesty, pristine UI density, ultra-private local timelines, and professional-grade rendering pipelines that run entirely lag-free.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#147CFF]">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Our Values</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Creators first. We respect your time, secure your intellectual assets, and optimize your rendering pipelines with high-priority GPU cloud infrastructure.
            </p>
          </div>
        </div>

        {/* Detailed Narrative Story */}
        <div className="space-y-6 text-on-surface-variant text-sm leading-relaxed sm:text-base">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Our Story & Operational Framework
          </h2>
          <p>
            Founded by creators who grew tired of spending five hours fine-tuning visual keyframes and audio drops for a simple thirty-second social media reel, ShotNode was designed to bridge the gap between creative imagination and technological friction.
          </p>
          <p>
            Operating under our parent company, <strong>SECONDBRAIN VENTURES PRIVATE LIMITED</strong>, our team combines senior acoustic engineers, timeline system architects, and graphic interface specialists to construct a comprehensive workstation-grade mobile and desktop editor sandbox.
          </p>
          <p>
            Our core AI engines analyze high-fidelity audio tracks to extract precise transient beats, allowing for automated, perfectly timed clips transitions. At the same time, our smart framing networks evaluate subject positions across frame coordinates to automatically center 9:16 social formats.
          </p>
        </div>

        {/* Corporate Address Block */}
        <div className="border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <h3 className="font-mono text-xs text-white tracking-widest font-bold uppercase">
              Headquarters & Registered Address
            </h3>
            <div className="space-y-1.5 text-xs text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-white">SECONDBRAIN VENTURES PRIVATE LIMITED</p>
              <p>Seat BS2T4, H-1A/20,</p>
              <p>Sector 63, Noida,</p>
              <p>Uttar Pradesh - 201301, India</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-mono text-xs text-white tracking-widest font-bold uppercase">
              Operational Inquiries
            </h3>
            <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <p>
                For partnership proposals, general operational questions, or press requests:
              </p>
              <p>
                Email: <a href="mailto:k.naveen6767@gmail.com" className="text-[#00D8FF] underline font-mono">k.naveen6767@gmail.com</a>
              </p>
              <p>
                Support Hub: <span className="font-mono text-white">support@shotnode.ai</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
