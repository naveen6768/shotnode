/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Globe,
  FileText,
  Info,
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#010204] text-white font-sans bg-noise relative pt-24 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00D8FF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#147CFF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Navigation Action & Title Block */}
        <div className="space-y-6">
          <Link
            id="privacy-back-btn"
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00D8FF] hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-[#147CFF]/40 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#147CFF]/5 border border-[#147CFF]/15 text-xs font-mono text-[#00D8FF] uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Legal Document
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base">
              Last Updated: October 26, 2026. Effective for the ShotNode
              Android app and its supporting website.
            </p>
          </div>
        </div>

        {/* Main Document Content */}
        <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                1
              </span>
              Introduction & Corporate Identity
            </h2>
            <p>
              Welcome to ShotNode AI (referred to herein as the "App" or
              "Service"), designed, developed, and operated by{" "}
              <strong>SECONDBRAIN VENTURES PRIVATE LIMITED</strong> (referred to
              as "Company", "We", "Our", or "Us"), a private limited company
              registered in Noida, Uttar Pradesh, India.
            </p>
            <p>
              We are committed to protecting and respecting your private data.
              This Privacy Policy outlines how your personal information is
              gathered, managed, processed, and safeguarded when you download,
              install, access, or use the ShotNode AI software applications,
              associated cloud rendering platforms, and official web services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                2
              </span>
              Information We Collect
            </h2>
            <p>
              We compile personal, analytical, and technical metadata elements
              to ensure standard service features function correctly:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Account Information:</strong>{" "}
                When registering for the Android app or contacting support, you
                may provide your email address, profile name, content
                preferences, and related authentication identifiers.
              </li>
              <li>
                <strong className="text-white">
                  Media Files & Content Assets:
                </strong>{" "}
                To perform AI-powered rough cutting, beat-syncing, and smart
                reframing, the App accesses your local gallery media assets,
                video frames, and sound tracks. All raw processing is executed
                locally on your device hardware whenever possible. Content
                uploads for cloud rendering are cached temporarily and
                automatically deleted once the export timeline completes.
              </li>
              <li>
                <strong className="text-white">Usage & System Metadata:</strong>{" "}
                We automatically collect standard telemetry regarding
                application stability, performance crashes, tool actions, UI
                selections, and aspect ratio profiles to prevent runtime layout
                distortion.
              </li>
              <li>
                <strong className="text-white">Device Information:</strong>{" "}
                General parameters like device models, operating system details,
                screen dimensions, resolution, and IP addresses are referenced
                purely to support dynamic layout responsiveness.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                3
              </span>
              How We Use Collected Information
            </h2>
            <p>
              The gathered user information and metadata elements are channeled
              into the following operational workflows:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                To supply, configure, stabilize, and refine the core interactive
                editing timeline sandbox.
              </li>
              <li>
                To execute automated visual-audio transient alignment (Beat-Sync
                cuts) and camera panning.
              </li>
              <li>
                To deliver account and support communications securely.
              </li>
              <li>
                To process secure billing subscriptions and analytical
                performance summaries.
              </li>
              <li>
                To comply with regulatory obligations and prevent service
                disruptions.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                4
              </span>
              App Permissions Disclosure
            </h2>
            <p>
              The application may request the following native Android
              permissions during operational interactions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">
                  Storage / Photo Library access:
                </strong>{" "}
                Essential for selecting, trimming, and compiling local B-rolls
                or video clips onto timelines.
              </li>
              <li>
                <strong className="text-white">
                  Microphone / Audio inputs:
                </strong>{" "}
                Required if you use our voice caption overlay translation
                features.
              </li>
              <li>
                <strong className="text-white">Camera access:</strong> Necessary
                if capturing live sequences directly inside the App sandbox.
              </li>
            </ul>
            <p className="text-xs text-[#00D8FF] font-mono italic">
              These permissions are requested only when active tools are
              initiated, and you may opt-out anytime through device settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                5
              </span>
              Data Sharing & Third-Party Integrations
            </h2>
            <p>
              We do not distribute, sell, trade, or lease your private personal
              details or compiled video assets to secondary advertising
              corporations. We only utilize trusted cloud partners to host our
              services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">
                  Google Cloud Run & Firestore:
                </strong>{" "}
                For hosting backend services and storing app data.
              </li>
              <li>
                <strong className="text-white">Firebase Authentication:</strong>{" "}
                For managing secure profile log-ins.
              </li>
              <li>
                <strong className="text-white">Google Play Console:</strong> For
                standard distribution analytics and billing processes.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                6
              </span>
              Your Privacy Rights & Choices
            </h2>
            <p>
              Under global security frameworks, you hold structural ownership
              over your shared personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                You may request complete access to all personal profile records
                cached in our databases.
              </li>
              <li>
                You can correct, update, or completely delete your account
                registration at any time.
              </li>
              <li>
                You may opt-out of marketing circulars or promotional updates by
                clicking unsubscribe.
              </li>
            </ul>
            <p>
              To delete your Firebase / Google-linked ShotNode account, prepare
              an email request at{" "}
              <Link
                to="/delete-account"
                className="text-[#00D8FF] font-mono hover:underline"
              >
                shotnode.pro/delete-account
              </Link>
              , or send a clear deletion instruction to{" "}
              <a
                href="mailto:contact@shotnode.pro"
                className="text-[#00D8FF] font-mono hover:underline"
              >
                contact@shotnode.pro
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                7
              </span>
              Operational Safety & Compliance
            </h2>
            <p>
              We integrate high-standard safety mechanisms to guard against
              illegal leaks, alteration, or distribution of details. All
              transactions are proxied securely, and databases are strictly
              hardened with access controls.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Contact & Representative Address
            </h2>
            <div className="space-y-2 text-xs leading-relaxed text-on-surface-variant">
              <p className="font-semibold text-white">
                SECONDBRAIN VENTURES PRIVATE LIMITED
              </p>
              <p>
                Seat BS2T4, H-1A/20, Sector 63, Noida, Uttar Pradesh - 201301,
                India
              </p>
              <p>
                Authorized email:{" "}
                <a
                  href="mailto:contact@shotnode.pro"
                  className="text-[#00D8FF] font-mono hover:underline"
                >
                  contact@shotnode.pro
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
