import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Header from "./Header";
import Brand from "./Brand";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main
        id="main-content"
        className={
          pathname === "/" || pathname === "/about" ? "" : "document-page"
        }
      >
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-main container">
          <div className="footer-brand">
            <Brand />
            <p>
              Your creative studio.
              <br />
              Right on your phone.
            </p>
            <a href="mailto:k.naveen6767@gmail.com">
              Let’s talk <ArrowUpRight size={14} />
            </a>
          </div>
          <div>
            <h3>Product</h3>
            <Link to="/#features-section">Features</Link>
            <Link to="/#tools-section">How it works</Link>
            <Link to="/#download-section">Get the Android app</Link>
          </div>
          <div>
            <h3>Company</h3>
            <Link to="/about">Our story</Link>
            <a href="mailto:k.naveen6767@gmail.com">Contact us</a>
            <Link to="/#faq-section">FAQs</Link>
          </div>
          <div>
            <h3>The fine print</h3>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of service</Link>
            <Link to="/delete-account">Delete account</Link>
          </div>
        </div>
        <div className="footer-bottom container">
          <span>
            © {new Date().getFullYear()} ShotNode. All rights reserved.
          </span>
          <span>
            Made for the way you create. <span className="orange-dot" />
          </span>
        </div>
      </footer>
    </div>
  );
}
