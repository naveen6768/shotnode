import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "./Brand";
import DownloadLink from "./DownloadLink";
import { useBlogAvailability } from "../lib/useBlogAvailability";

export default function Header() {
  const [open, setOpen] = useState(false);
  const blogAvailable = useBlogAvailability();
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  const links = [
    { label: "Product", to: "/#features-section" },
    { label: "How it works", to: "/#tools-section" },
    { label: "Get the app", to: "/#download-section" },
    ...(blogAvailable ? [{ label: "Blog", to: "/blog" }] : []),
    { label: "Our story", to: "/about" },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <DownloadLink className="button button-dark button-small">
            Get the app
          </DownloadLink>
          <button
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
