/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Scale, FileText, CheckCircle, HelpCircle } from "lucide-react";

interface TermsOfServiceProps {
  onBackToHome: () => void;
}

export default function TermsOfService({ onBackToHome }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-[#010204] text-white font-sans bg-noise relative pt-24 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#147CFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00D8FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Navigation Action & Title Block */}
        <div className="space-y-6">
          <button
            id="terms-back-btn"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00D8FF] hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-[#147CFF]/40 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#147CFF]/5 border border-[#147CFF]/15 text-xs font-mono text-[#00D8FF] uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5" />
              User Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Terms of Service
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base">
              Last Updated: June 24, 2026. Effective for ShotNode AI Applications and Operations.
            </p>
          </div>
        </div>

        {/* Main Terms Document */}
        <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By installing, downloading, registering, or accessing any service, mobile application, or timeline sandbox feature offered by <strong>SECONDBRAIN VENTURES PRIVATE LIMITED</strong> ("ShotNode AI", "Company", "We", "Our", or "Us"), you unconditionally agree to comply with and be bound by these Terms of Service.
            </p>
            <p>
              If you do not agree to all specifications or legal clauses listed herein, you are strictly prohibited from utilizing the App or associated cloud servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">2</span>
              Limited Software License Grant
            </h2>
            <p>
              We grant you a non-exclusive, non-transferable, revocable, limited license to run the ShotNode AI executable binary and use its web editing platform solely for your personal or authorized professional video production workflows. This license is subject to compliance with our guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may not modify, reverse engineer, decompile, translate, or copy the source code of our App.</li>
              <li>You may not distribute, lease, sell, or sublicense the software components to external operators.</li>
              <li>You may not inject automated scripts, web scrapers, or telemetry interception tools into the timeline engine.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">3</span>
              Intellectual Property Rights
            </h2>
            <p>
              The entire architectural design, layout styles, logo components, dynamic graphics, source codes, proprietary beat-sync algorithms, custom visual-audio models, sound scanning vectors, and branding marks associated with ShotNode AI are the exclusive intellectual property of <strong>SECONDBRAIN VENTURES PRIVATE LIMITED</strong>.
            </p>
            <p>
              All video assets, rough clips, soundtrack additions, and raw timelines compiled or created by you inside the editing sandbox remain your exclusive property. We do not claim intellectual ownership or distribution rights over user-generated timelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">4</span>
              Subscription Plans, Fees, & Billing Cycles
            </h2>
            <p>
              Standard early beta access to ShotNode is supplied free of charge. Full unlock of Creator Pro tiers requires active billing registration:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fees are collected on an automated periodic cycle (Monthly or Annually) as selected.</li>
              <li>Annual billing models receive up to 30% discount profiles as declared in our pricing section.</li>
              <li>All subscription cancellations must be filed at least 48 hours prior to the next billing date.</li>
              <li>Refund requests are handled on a case-by-case basis according to Play Store distribution frameworks.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">5</span>
              Prohibited Content & Actions
            </h2>
            <p>
              When utilizing our AI-powered natural language prompt input and cloud rendering infrastructure, you agree never to submit content that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Violates intellectual copyrights, trademarks, or visual licensing rules of other entities.</li>
              <li>Contains illegal visual assets, violence, harassment, or defamatory messaging.</li>
              <li>Attempts to intentionally crash the rendering queue servers or inject malicious scripts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">6</span>
              Disclaimer of Warranties
            </h2>
            <p className="italic text-gray-400">
              ShotNode AI is provided strictly on an "AS IS" and "AS AVAILABLE" basis. SECONDBRAIN VENTURES PRIVATE LIMITED disclaims all representations, warranties, or assurances of any kind, whether express, statutory, or implied, including warranties of merchantability, timeline rendering speed, continuous cloud uptime, or fitment for specific social distribution targets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">7</span>
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by governing laws, SECONDBRAIN VENTURES PRIVATE LIMITED, its directors, developers, or operational agents shall not be liable for any indirect, consequential, special, punitive, or incidental damages, including loss of creative files, timeline rendering delays, GPU cloud server downtime, or loss of marketing revenue arising from the use of the App.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">8</span>
              Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms of Service are governed, construed, and enforced in accordance with the laws of Uttar Pradesh, India. Any legal dispute, claim, or litigation arising out of our application or operations shall be subject to the exclusive jurisdiction of the state courts located in Noida, Uttar Pradesh, India.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Corporate Office & Registered Address
            </h2>
            <div className="space-y-2 text-xs leading-relaxed text-on-surface-variant">
              <p className="font-semibold text-white">SECONDBRAIN VENTURES PRIVATE LIMITED</p>
              <p>Seat BS2T4, H-1A/20, Sector 63, Noida, Uttar Pradesh - 201301, India</p>
              <p>
                Authorized contact email: <a href="mailto:k.naveen6767@gmail.com" className="text-[#00D8FF] font-mono hover:underline">k.naveen6767@gmail.com</a>
              </p>
              <p>
                Inquiries regarding standard legal terms can be forwarded to <span className="font-mono text-white">support@shotnode.ai</span>.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
