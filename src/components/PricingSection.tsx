/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PricingPlan } from "../types";

interface PricingSectionProps {
  onJoinWaitlist: () => void;
}

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Early Access",
    priceMonthly: 0,
    priceYearly: 0,
    period: "during beta",
    features: [
      "720p H.264 standard exports",
      "Basic NLP AI prompt slots",
      "Automatic audio beat-sync",
      "Single-track timeline render",
    ],
    ctaText: "Join Waitlist",
  },
  {
    id: "pro",
    name: "Creator Pro",
    priceMonthly: 29,
    priceYearly: 19,
    period: "mo",
    features: [
      "4K ProRes & HEVC exports",
      "Unlimited AI prompt slots",
      "Advanced synth camera motion",
      "High-priority cloud queues",
      "3D LUT color grade imports",
    ],
    ctaText: "Subscribe",
    isPopular: true,
  },
  {
    id: "studio",
    name: "Studio",
    priceMonthly: 99,
    priceYearly: 69,
    period: "mo",
    features: [
      "Custom AI model fine-tuning",
      "Shared collaborative workspace",
      "Developer API credentials",
      "24/7 dedicated support desk",
      "Unlimited high-bitrate outputs",
    ],
    ctaText: "Contact Sales",
  },
];

export default function PricingSection({ onJoinWaitlist }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const toggleBilling = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  return (
    <section id="pricing-section" className="py-32 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto relative">
      <div className="text-center mb-16 space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#147CFF] font-bold">
          Flexible Pricing Models
        </span>
        <h2 className="font-sans font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Uncompromising tools. Simple pricing.
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto">
          Choose the creative tier that fits your pacing. Save up to 30% with annual subscription plans.
        </p>

        {/* Monthly / Yearly Billing Toggle pills */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-[#02060C] border border-white/5 rounded-full p-1 flex items-center gap-1.5 shadow-inner">
            <button
              id="billing-monthly-btn"
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#147CFF] text-white"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Billed Monthly
            </button>
            <button
              id="billing-yearly-btn"
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-[#147CFF] text-white"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Billed Annually
              <span className="bg-[#00D8FF]/20 text-[#00D8FF] px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider font-extrabold uppercase">
                -30%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const isPro = plan.isPopular;
          const displayPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              id={`pricing-card-${plan.id}`}
              key={plan.id}
              className={`rounded-2xl p-8 flex flex-col justify-between border transition-all duration-300 relative ${
                isPro
                  ? "border-[#147CFF] md:-translate-y-4 shadow-[0_30px_60px_rgba(20,124,255,0.15)] bg-[#147CFF]/5"
                  : "border-white/10 bg-[#010204]/40 hover:border-white/20"
              }`}
            >
              {/* Popular Tag Badge */}
              {isPro && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#147CFF] to-[#00D8FF] text-white px-4 py-1 rounded-full font-mono text-[9px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(20,124,255,0.5)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: "10s" }} />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-sans font-bold text-xl text-white mb-2">{plan.name}</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  {plan.priceMonthly === 0 ? (
                    <span className="font-sans font-extrabold text-4xl sm:text-5xl text-white">Free</span>
                  ) : (
                    <>
                      <span className="font-sans font-extrabold text-4xl sm:text-5xl text-white">
                        ${displayPrice}
                      </span>
                      <span className={`text-sm ${isPro ? "text-[#00D8FF]" : "text-on-surface-variant"}`}>
                        /{plan.period}
                      </span>
                    </>
                  )}
                  {billingCycle === "yearly" && plan.priceMonthly > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono pl-2">
                      Billed yearly
                    </span>
                  )}
                </div>

                {/* Features Checklist */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-on-surface-variant">
                      <div className={`mt-0.5 rounded p-0.5 ${isPro ? "bg-[#00D8FF]/10 text-[#00D8FF]" : "bg-white/5 text-gray-500"}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={isPro ? "text-white" : ""}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                id={`plan-action-btn-${plan.id}`}
                onClick={onJoinWaitlist}
                className={`w-full py-3.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  isPro
                    ? "bg-gradient-to-r from-[#147CFF] to-[#00D8FF] text-white hover:shadow-[0_0_25px_rgba(20,124,255,0.4)]"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
