/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Play,
  Zap,
  Waves,
  Crop,
  Layers,
  ArrowUpRight,
  Tv,
  Subtitles,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import Header from "./components/Header";
import EditorPreview from "./components/EditorPreview";
import CommandPromptDemo from "./components/CommandPromptDemo";
import PricingSection from "./components/PricingSection";
import FAQAccordion from "./components/FAQAccordion";
import WaitlistModal from "./components/WaitlistModal";
import DemoVideoModal from "./components/DemoVideoModal";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "about" | "privacy" | "terms">("home");
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isStepHovered, setIsStepHovered] = useState(false);

  useEffect(() => {
    if (isStepHovered) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [isStepHovered]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pre-fill user email into local storage or similar if needed
  const userEmail = "k.naveen6767@gmail.com";

  return (
    <div className="bg-[#010204] text-white font-sans bg-noise min-h-screen relative antialiased selection:bg-[#147CFF]/30 selection:text-white overflow-x-hidden">
      {/* Glow highlight source in top background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,rgba(20,124,255,0.12)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 tech-grid z-0 opacity-20 pointer-events-none" />

      {/* Global Navigation Bar */}
      <Header
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* Main Content Stage */}
      <main className="pt-32 relative z-10">
        {currentView === "home" && (
          <>
            {/* HERO SECTION */}
            <section className="min-h-[85vh] flex items-center px-4 md:px-12 max-w-7xl mx-auto relative mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            
            {/* Left side: Heading and CTAs */}
            <div className="space-y-8 text-left z-10">
              {/* Live Beta Alert Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#147CFF]/10 border border-[#147CFF]/30 shadow-[0_0_15px_rgba(20,124,255,0.15)]">
                <span className="w-2 h-2 rounded-full bg-[#00D8FF] animate-pulse shadow-[0_0_8px_#00D8FF]" />
                <span className="font-mono text-[10px] text-[#00D8FF] uppercase tracking-widest font-bold">
                  ShotNode Beta Live
                </span>
              </div>

              {/* Display Title */}
              <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                The AI video editor built for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#147CFF] to-[#00D8FF] glow-text drop-shadow-[0_0_15px_rgba(20,124,255,0.8)]">
                  creators who move fast.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-on-surface-variant text-base sm:text-lg max-w-xl leading-relaxed">
                Command complex edits with natural language. Generate cuts, sync beats, and execute creative direction frame-by-frame instantly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 items-center pt-2">
                <button
                  id="hero-join-waitlist-btn"
                  onClick={() => setIsWaitlistOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#147CFF] to-[#00D8FF] hover:shadow-[0_0_25px_rgba(20,124,255,0.4)] text-white px-8 py-4 rounded-xl font-bold tracking-wide flex justify-center items-center gap-2 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  <span>Join Early Access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Available On Play Store badge */}
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md w-full sm:w-auto justify-center sm:justify-start">
                  <img
                    alt="Play Store App Icon"
                    className="w-9 h-9 rounded-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTZTE9f_o2j8YJKb4p1ZXX746eXfv82i23dsBv_KMzW-xvomjvaOXrCkHIO3eVAEicllvifA7sipjl-izQY4b6ig00R7xFfOj1zX84_WYAA-QI32ficdEiwBVX1ykaVneYsR44ynwQ2oHoM0joDtJrEg2Y3CPkioDk3PsuLaPshBEvPvBMBjsPnXBeSr7tLJSFb3plvQEr4des3_jTlsRMGgCUlhM2_t3XKoLlteWvEJZYXmKtD8mXf24TpR8g-iUdBcnt_NqEQKTM"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="text-white text-[11px] font-semibold">Available Now</div>
                    <div className="text-on-surface-variant text-[9px] font-mono uppercase tracking-wider">Play Store</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: 3D interactive mockup preview */}
            <div className="w-full flex items-center justify-center">
              <EditorPreview />
            </div>
          </div>
        </section>


        {/* FRICTION / PROBLEM SECTION */}
        <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto border-t border-white/10 bg-white/[0.01] backdrop-blur-md relative overflow-hidden">
          {/* Corner Ambient lights */}
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#147CFF]/5 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#00D8FF]/5 blur-3xl rounded-full" />

          {/* Section heading */}
          <div className="text-center mb-20 space-y-3">
            <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Editing should not take hours for a 30-second reel.
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Manual cutting, keyframing, and searching for the right beat breaks your creative flow. ShotNode automation handles the technical friction.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Tedious Rough Cuts */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 border border-white/10 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#147CFF]/40 transition-colors">
                <Zap className="w-5 h-5 text-gray-400 group-hover:text-[#147CFF] transition-colors" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white mb-3">Tedious Rough Cuts</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Sifting through hours of raw B-roll footage just to crop out the perfect 2-second clip kills creative momentum.
              </p>
            </div>

            {/* Card 2: Manual Beat Syncing */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 border border-white/10 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#00D8FF]/40 transition-colors">
                <Waves className="w-5 h-5 text-gray-400 group-hover:text-[#00D8FF] transition-colors" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white mb-3">Manual Beat Syncing</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Aligning sequence cuts to audio baseline transients manually is incredibly detailed but painfully repetitive.
              </p>
            </div>

            {/* Card 3: Re-framing */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 border border-white/10 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#147CFF]/40 transition-colors">
                <Crop className="w-5 h-5 text-gray-400 group-hover:text-[#147CFF] transition-colors" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white mb-3">Re-framing for Social</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Keyframing widescreen 16:9 shots to track moving target subjects inside social 9:16 boundaries is tedious work.
              </p>
            </div>
          </div>
        </section>


        {/* COMMAND THE TIMELINE - BENTO SECTION */}
        <section id="features-section" className="py-32 px-4 md:px-12 max-w-7xl mx-auto space-y-16">
          
          {/* Section Info */}
          <div className="text-left space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#00D8FF] font-bold">
              Autonomous Timeline Engine
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Command the timeline.
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-lg leading-relaxed">
              High-performance AI tools engineered for complex creative workflows, not just template presets.
            </p>
          </div>

          {/* Bento Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento 1: Large Waveform Beat Syncing Card */}
            <div className="glass-modal rounded-2xl p-8 md:col-span-8 flex flex-col justify-between relative overflow-hidden group border border-white/10 min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#010204] via-black/40 to-transparent z-10" />
              
              {/* High-tech audio waveform background image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-[1.02] transition-transform duration-700 mix-blend-screen pointer-events-none"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfpEMpyU31BpAR6GPAyPGWcxWQGSU9GA64U57UVxPs6i5xWWsHl8ePDaMZNqdmrZyBFGYyjnW1t2x4tV9Kbl_BybWdIBiOsKY2SvAc9QC8v6rr_K0uvidMCV4dkbTRQ5xT1TLsuFolJCOawqOtPp_b9x3m3lJw_slNx1nDeGcjEtYpIyiTAs5VemWO8KRGh-TgpNKi9lRHni9vYkS2IHWJjNgrfcMvJFAeDudwRoBXhUoP2gt7KUgqOhbr00eV1WkE2VyingDSOUNO')`,
                }}
              />

              {/* Floating Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#010204]/75 border border-white/10 backdrop-blur-md w-fit z-20">
                <Waves className="w-3.5 h-3.5 text-[#00D8FF]" />
                <span className="font-mono text-[9px] text-white uppercase tracking-wider font-bold">
                  Audio Engine
                </span>
              </div>

              {/* Description Content */}
              <div className="relative z-20 space-y-2 mt-24">
                <h3 className="font-sans font-extrabold text-2xl text-white">
                  Beat-Synced Editing
                </h3>
                <p className="text-on-surface-variant text-sm max-w-md leading-relaxed">
                  ShotNode deep scans raw background music transients and automatically synchronizes B-roll video clip sequences on peak beat drops.
                </p>
              </div>
            </div>

            {/* Bento 2: Small Camera Motion Action */}
            <div className="glass-panel rounded-2xl p-8 md:col-span-4 relative overflow-hidden flex flex-col justify-between border-t-[#147CFF] border border-white/10 group min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#147CFF]/5 to-transparent pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#147CFF]/10 border border-[#147CFF]/20 flex items-center justify-center text-[#147CFF] shadow-[0_0_15px_rgba(20,124,255,0.15)] group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-[#00D8FF]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xl text-white">Camera Motion</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Generate synthetic cinematic panning, zooming sliders, and crane tracking motions on static assets instantly.
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-[#00D8FF] uppercase tracking-widest pt-4 font-semibold">
                Workstation grade
              </div>
            </div>

            {/* Bento 3: Small Smart Reframe Action */}
            <div className="glass-panel rounded-2xl p-8 md:col-span-4 relative overflow-hidden flex flex-col justify-between border-t-[#00D8FF] border border-white/10 group min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D8FF]/5 to-transparent pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/20 flex items-center justify-center text-[#00D8FF] shadow-[0_0_15px_rgba(0,216,255,0.15)] group-hover:scale-105 transition-transform">
                  <Crop className="w-5 h-5 text-[#00D8FF]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xl text-white">Smart Reframe</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    AI visual tracking automatically isolates and centers key subjects when re-rendering widescreen horizontal clips into vertical social grids.
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-[#147CFF] uppercase tracking-widest pt-4 font-semibold">
                Multi-aspect support
              </div>
            </div>

            {/* Bento 4: Large Interactive NLP Slider Box */}
            <CommandPromptDemo onNotify={(msg) => showToast(msg)} />

          </div>
        </section>


        {/* WORKFLOW PATH NODE DIAGRAM SECTION */}
        <section id="tools-section" className="py-28 relative overflow-hidden border-y border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 md:px-12 text-center space-y-16">
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#147CFF] font-bold">
                Automated Linear Pipeline
              </span>
              <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Prompt. Plan. Edit. Preview.
              </h2>
            </div>

            <div className="relative mt-8">
              {/* Background horizontal connector line - centered exactly behind the circles (64px height = 32px/top-8 center) */}
              <div className="absolute top-8 left-[12.5%] right-[12.5%] h-[1px] bg-white/10 hidden md:block z-0" />
              
              {/* Active illuminated progress path */}
              <div 
                className="absolute top-8 left-[12.5%] h-[2px] bg-gradient-to-r from-[#147CFF] to-[#00D8FF] shadow-[0_0_12px_#00D8FF] hidden md:block z-0 transition-all duration-500 ease-out"
                style={{
                  width: `${(activeStepIndex / 3) * 75}%`
                }}
              />

              {/* Active pulsating end-point indicator */}
              <div 
                className="absolute top-[28px] w-3 h-3 rounded-full bg-[#00D8FF] border-2 border-[#010204] shadow-[0_0_12px_#00D8FF] hidden md:block z-10 transition-all duration-500 ease-out -translate-x-1.5"
                style={{
                  left: `${12.5 + (activeStepIndex / 3) * 75}%`
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { id: "step1", step: "01", title: "Describe", subtitle: "Input Prompt", icon: Sparkles },
                  { id: "step2", step: "02", title: "Understand", subtitle: "Semantic Logic", icon: Zap },
                  { id: "step3", step: "03", title: "AI Build", subtitle: "Assemble Nodes", icon: Layers },
                  { id: "step4", step: "04", title: "Execute", subtitle: "Render Timeline", icon: Play },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeStepIndex === index;
                  return (
                    <div 
                      key={item.id} 
                      onMouseEnter={() => {
                        setIsStepHovered(true);
                        setActiveStepIndex(index);
                      }}
                      onMouseLeave={() => {
                        setIsStepHovered(false);
                      }}
                      className="flex flex-col items-center space-y-4 group cursor-pointer"
                    >
                      {/* Step Circle with responsive scaling and active shadow glow */}
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 ${
                          isActive
                            ? "border-[#00D8FF] bg-[#147CFF]/20 text-[#00D8FF] shadow-[0_0_30px_rgba(20,124,255,0.4)] scale-110"
                            : "border-white/10 bg-[#02060C] text-on-surface-variant group-hover:border-white/20 group-hover:text-white scale-100"
                        }`}
                      >
                        <Icon className={`w-6 h-6 transition-transform duration-500 ${isActive ? "scale-110 text-[#00D8FF]" : "text-gray-400 group-hover:text-white"}`} />
                      </div>
                      
                      {/* Step Text details */}
                      <div className="text-center space-y-1">
                        <div className={`text-[10px] font-mono font-bold tracking-wider transition-colors duration-300 ${isActive ? "text-[#00D8FF]" : "text-gray-500"}`}>
                          STEP {item.step}
                        </div>
                        <h4 className={`font-sans font-bold text-base transition-colors duration-300 ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                          {item.title}
                        </h4>
                        <p className="font-mono text-[11px] text-on-surface-variant transition-colors group-hover:text-gray-300">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* PRICING SECTION */}
        <PricingSection onJoinWaitlist={() => setIsWaitlistOpen(true)} />


        {/* FAQ ACCORDION SECTION */}
        <FAQAccordion />


        {/* CTA CONCLUDING FOOTER BAR BANNER */}
        <section className="py-24 px-4 md:px-12 max-w-5xl mx-auto relative text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#147CFF]/10 to-[#00D8FF]/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative glass-modal rounded-3xl p-8 sm:p-12 border border-[#147CFF]/20 overflow-hidden space-y-6">
            <div className="absolute inset-0 bg-noise opacity-10" />
            <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Ready to edit at the speed of thought?
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Join our active community of professional creators and secure your private sandbox reservation.
            </p>
            <div className="pt-2">
              <button
                id="footer-waitlist-btn"
                onClick={() => setIsWaitlistOpen(true)}
                className="bg-gradient-to-r from-[#147CFF] to-[#00D8FF] hover:shadow-[0_0_20px_rgba(20,124,255,0.4)] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wide inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Reserve Your Position</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
          </>
        )}

        {currentView === "about" && (
          <AboutUs onBackToHome={() => setCurrentView("home")} />
        )}

        {currentView === "privacy" && (
          <PrivacyPolicy onBackToHome={() => setCurrentView("home")} />
        )}

        {currentView === "terms" && (
          <TermsOfService onBackToHome={() => setCurrentView("home")} />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#010204]/90 backdrop-blur-3xl z-30 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 items-start">
          
          {/* Logo brand and copyrights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                className="h-8 w-auto object-contain"
                alt="ShotNode Logo"
                src="https://lh3.googleusercontent.com/aida/AP1WRLsFNgnhBA4aDl9FVK6dbHT0J3v51srk4W7IQkj6g6MRrqCTfjNS5Cv-Wc_3UBfkLoCPNgbR4yOg77iIa74VyYw8M1cGdegIBnX0JJhdWqpX76DA66wI5LYyKmcn6mwirzCVGGRIew2gP6KUbCc2h_PdoQtLk3KzCo3KudLPWcF_P9P2_61fInzT9nFljmFYyHBvK1M7rfaFcE489ceo5pUT2zEI80ei4A5KpugyEkh6V6VTmSzlHRxG43H7"
                referrerPolicy="no-referrer"
              />
              <span className="font-sans font-bold text-lg text-white">ShotNode</span>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs">
              © 2026 ShotNode AI. Edit the impossible. Frame by frame.
            </p>
          </div>

          {/* Links col 1 */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setCurrentView("home");
                    setTimeout(() => {
                      document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("home");
                    setTimeout(() => {
                      document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => showToast("Changelog feature is coming soon in final release!", "info")}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  Changelog
                </button>
              </li>
            </ul>
          </div>

          {/* Links col 2 */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setCurrentView("about");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => showToast("ShotNode Careers: We're expanding soon!", "info")}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <a href="mailto:k.naveen6767@gmail.com" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Links col 3 */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setCurrentView("privacy");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left animate-pulse"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("terms");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>
      </footer>

      {/* POPUP MODALS */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        defaultEmail={userEmail}
      />

      <DemoVideoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      {/* Toast Notification Popup */}
      {toast && (
        <div id="global-toast" className="fixed bottom-6 right-6 z-50 glass-panel border border-[#00D8FF]/30 p-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-white">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
