/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onOpenWaitlist: () => void;
  onOpenDemo: () => void;
}

export default function Header({ onOpenWaitlist, onOpenDemo }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Product");
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const navLinks = [
    { label: "Product", to: "/", hash: "", isSection: true },
    { label: "AI Editing", to: "/#features-section", hash: "#features-section", isSection: true },
    { label: "Tools", to: "/#tools-section", hash: "#tools-section", isSection: true },
    { label: "About Us", to: "/about", hash: "", isSection: false },
    { label: "Pricing", to: "/#pricing-section", hash: "#pricing-section", isSection: true },
  ];

  React.useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;

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
  }, [isHome]);

  const isLinkActive = (link: (typeof navLinks)[0]) => {
    if (link.to === "/about") return pathname === "/about";
    if (!isHome) return false;
    return link.isSection && activeSection === link.label;
  };

  return (
    <nav className="bg-[#010204]/70 backdrop-blur-2xl fixed top-0 w-full z-40 border-b border-white/10 shadow-[0_0_20px_rgba(20,124,255,0.05)]">
      <div className="flex justify-between items-center h-20 px-4 md:px-12 w-full max-w-7xl mx-auto">
        <Link id="brand-logo-container" to="/" className="flex items-center gap-3 cursor-pointer group">
          <img
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            alt="ShotNode Logo"
            src="/logo.svg"
          />
          <span className="font-sans text-xl font-extrabold text-white tracking-tighter group-hover:text-[#00D8FF] transition-colors">
            ShotNode
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              key={link.label}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`font-sans text-[13px] font-medium tracking-wide transition-all duration-200 relative py-1 ${
                isLinkActive(link)
                  ? "text-[#00D8FF] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00D8FF]"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#010204]/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  id={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`font-sans text-sm py-2 tracking-wide block ${
                    isLinkActive(link) ? "text-[#00D8FF] font-semibold" : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

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
