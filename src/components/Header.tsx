/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Menu, X, Play, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onOpenWaitlist: () => void;
  onOpenDemo: () => void;
  currentView: "home" | "about" | "privacy" | "terms";
  onNavigate: (view: "home" | "about" | "privacy" | "terms") => void;
}

export default function Header({ onOpenWaitlist, onOpenDemo, currentView, onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Product");

  const navLinks = [
    { label: "Product", view: "home", href: "#", isSection: true },
    { label: "AI Editing", view: "home", href: "#features-section", isSection: true },
    { label: "Tools", view: "home", href: "#tools-section", isSection: true },
    { label: "About Us", view: "about", href: "#" },
    { label: "Pricing", view: "home", href: "#pricing-section", isSection: true },
  ];

  React.useEffect(() => {
    if (currentView !== "home") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240; // Offset for header height and triggers

      const sections = [
        { label: "Product", top: 0 },
        { label: "AI Editing", el: document.getElementById("features-section") },
        { label: "Tools", el: document.getElementById("tools-section") },
        { label: "Pricing", el: document.getElementById("pricing-section") },
      ];

      let current = "Product";
      for (const section of sections) {
        if (section.el) {
          const top = section.el.offsetTop;
          if (scrollPosition >= top) {
            current = section.label;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  const handleLinkClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (link.view === "home") {
      onNavigate("home");
      if (link.isSection && link.href && link.href.startsWith("#") && link.href.length > 1) {
        // Wait minor delay for render state to update
        setTimeout(() => {
          const el = document.querySelector(link.href);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      onNavigate(link.view as any);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBrandClick = () => {
    onNavigate("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="bg-[#010204]/70 backdrop-blur-2xl fixed top-0 w-full z-40 border-b border-white/10 shadow-[0_0_20px_rgba(20,124,255,0.05)]">
      <div className="flex justify-between items-center h-20 px-4 md:px-12 w-full max-w-7xl mx-auto">
        {/* Brand Logo & Name */}
        <div 
          id="brand-logo-container"
          onClick={handleBrandClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            alt="ShotNode Logo"
            src="https://lh3.googleusercontent.com/aida/AP1WRLsFNgnhBA4aDl9FVK6dbHT0J3v51srk4W7IQkj6g6MRrqCTfjNS5Cv-Wc_3UBfkLoCPNgbR4yOg77iIa74VyYw8M1cGdegIBnX0JJhdWqpX76DA66wI5LYyKmcn6mwirzCVGGRIew2gP6KUbCc2h_PdoQtLk3KzCo3KudLPWcF_P9P2_61fInzT9nFljmFYyHBvK1M7rfaFcE489ceo5pUT2zEI80ei4A5KpugyEkh6V6VTmSzlHRxG43H7"
            referrerPolicy="no-referrer"
          />
          <span className="font-sans text-xl font-extrabold text-white tracking-tighter group-hover:text-[#00D8FF] transition-colors">
            ShotNode
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isLinkActive = currentView === "home" ? (link.view === "home" && activeSection === link.label) : currentView === link.view;
            return (
              <a
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`font-sans text-[13px] font-medium tracking-wide transition-all duration-200 relative py-1 ${
                  isLinkActive
                    ? "text-[#00D8FF] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00D8FF]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            id="watch-demo-btn"
            onClick={onOpenDemo}
            className="btn-glass px-5 py-2 text-xs rounded-lg font-medium tracking-wide flex items-center gap-1.5 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Watch Demo
          </button>
          <button
            id="join-waitlist-btn-header"
            onClick={onOpenWaitlist}
            className="bg-gradient-to-r from-[#147CFF] to-[#00D8FF] hover:shadow-[0_0_20px_rgba(20,124,255,0.4)] text-white px-5 py-2 text-xs rounded-lg font-bold tracking-wide active:scale-95 transition-all cursor-pointer"
          >
            Join Waitlist
          </button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            id="join-waitlist-btn-mobile-shortcut"
            onClick={onOpenWaitlist}
            className="bg-gradient-to-r from-[#147CFF] to-[#00D8FF] px-3.5 py-1.5 text-xs rounded-lg font-bold tracking-wide text-white"
          >
            Join
          </button>
          <button
            id="mobile-menu-trigger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#010204]/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4 flex flex-col">
              {navLinks.map((link) => {
                const isLinkActive = currentView === "home" ? (link.view === "home" && activeSection === link.label) : currentView === link.view;
                return (
                  <a
                    id={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`font-sans text-sm py-2 tracking-wide block ${
                      isLinkActive ? "text-[#00D8FF] font-semibold" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}

              <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <button
                  id="mobile-watch-demo-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDemo();
                  }}
                  className="w-full btn-glass py-3 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-white/5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Watch Demo Video
                </button>
                <button
                  id="mobile-join-waitlist-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWaitlist();
                  }}
                  className="w-full bg-gradient-to-r from-[#147CFF] to-[#00D8FF] py-3 text-xs rounded-lg font-bold text-white shadow-lg shadow-[#147CFF]/15"
                >
                  Join Exclusive Waitlist
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
