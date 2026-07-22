/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Header from "./Header";
import WaitlistModal from "./WaitlistModal";
import DemoVideoModal from "./DemoVideoModal";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const userEmail = "k.naveen6767@gmail.com";

  return (
    <div className="bg-[#010204] text-white font-sans bg-noise min-h-screen relative antialiased selection:bg-[#147CFF]/30 selection:text-white overflow-x-hidden">
      <ScrollToTop />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,rgba(20,124,255,0.12)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute inset-0 tech-grid z-0 opacity-20 pointer-events-none" />

      <Header
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      <main className="pt-32 relative z-10">
        <Outlet context={{ onOpenWaitlist: () => setIsWaitlistOpen(true), showToast }} />
      </main>

      <footer className="border-t border-white/10 bg-[#010204]/90 backdrop-blur-3xl z-30 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 items-start">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img className="h-8 w-auto object-contain" alt="ShotNode Logo" src="/logo.svg" />
              <span className="font-sans font-bold text-lg text-white">ShotNode</span>
            </Link>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs">
              © 2026 ShotNode AI. Edit the impossible. Frame by frame.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/#features-section" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#pricing-section" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Pricing
                </Link>
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

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  About Us
                </Link>
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

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/delete-account" className="text-xs text-on-surface-variant hover:text-[#00D8FF] transition-colors">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} defaultEmail={userEmail} />
      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      {toast && (
        <div id="global-toast" className="fixed bottom-6 right-6 z-50 glass-panel border border-[#00D8FF]/30 p-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-white">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
