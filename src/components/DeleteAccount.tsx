/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Database,
  Mail,
} from "lucide-react";

const SUPPORT_EMAIL = "k.naveen6767@gmail.com";
const CONFIRM_PHRASE = "DELETE";

type FormState = "idle" | "submitting" | "submitted";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    email.includes("@") &&
    confirmText.trim().toUpperCase() === CONFIRM_PHRASE &&
    acknowledged &&
    formState === "idle";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Enter the email address linked to your ShotNode / Firebase login.");
      return;
    }
    if (confirmText.trim().toUpperCase() !== CONFIRM_PHRASE) {
      setError(`Type ${CONFIRM_PHRASE} to confirm permanent account deletion.`);
      return;
    }
    if (!acknowledged) {
      setError("Please acknowledge that account deletion is permanent.");
      return;
    }

    setFormState("submitting");

    const subject = encodeURIComponent("ShotNode Account Deletion Request");
    const body = encodeURIComponent(
      [
        "I request permanent deletion of my ShotNode account and associated personal data.",
        "",
        `Account email (Firebase / Google sign-in): ${email.trim()}`,
        reason.trim() ? `Reason (optional): ${reason.trim()}` : "Reason (optional): (none provided)",
        "",
        "Please delete my Firebase Authentication profile and related account data per your Delete Account policy.",
        "",
        "Submitted from: https://shotnode.pro/delete-account",
      ].join("\n"),
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    window.setTimeout(() => {
      setFormState("submitted");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#010204] text-white font-sans bg-noise relative pt-24 pb-16">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#147CFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        <div className="space-y-6">
          <Link
            id="delete-account-back-btn"
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00D8FF] hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-[#147CFF]/40 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/25 text-xs font-mono text-rose-300 uppercase tracking-widest">
              <Trash2 className="w-3.5 h-3.5" />
              Account Deletion
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Delete Your Account
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl">
              Request permanent deletion of your ShotNode account created with Firebase Authentication
              (Google sign-in). This page satisfies Google Play Console account-deletion disclosure
              requirements for the ShotNode Android app.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-on-surface-variant">
            <p className="text-amber-200 font-semibold">Deletion is permanent</p>
            <p>
              Once we process your request, your Firebase Auth profile, app account identity, and
              associated personal account data cannot be recovered. Local projects already saved on
              your device are not removed by this request — uninstall the app or clear app data if
              you also want those files removed from the device.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                1
              </span>
              How to request deletion
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Submit the form below using the same email address you used to sign in to ShotNode
                with Google / Firebase Authentication.
              </li>
              <li>
                Or email us directly at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("ShotNode Account Deletion Request")}`}
                  className="text-[#00D8FF] font-mono hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                with the subject line <span className="text-white font-mono text-xs">ShotNode Account Deletion Request</span>{" "}
                and include your account email.
              </li>
              <li>
                We verify ownership of the account and permanently delete the Firebase Authentication
                user record and related personal account data.
              </li>
              <li>
                You will receive a confirmation email when deletion is complete (typically within{" "}
                <strong className="text-white">7 business days</strong>, and no later than{" "}
                <strong className="text-white">30 days</strong>).
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                2
              </span>
              Data deleted when you request account deletion
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  icon: Shield,
                  title: "Firebase Authentication profile",
                  body: "User UID, Google-linked sign-in credentials, display name, and email associated with your ShotNode login.",
                },
                {
                  icon: Database,
                  title: "Account & profile records",
                  body: "App account identity, waitlist / support tickets tied to that email, and cloud profile metadata we store for your account.",
                },
                {
                  icon: Mail,
                  title: "Marketing & waitlist entries",
                  body: "Waitlist enrollments and promotional contact records linked to the deleted account email (unless legally required to retain).",
                },
                {
                  icon: Clock,
                  title: "Cloud session artifacts",
                  body: "Temporary cloud-render caches and remote session tokens associated with the account, purged on deletion.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <Icon className="w-4 h-4 text-[#00D8FF]" />
                      {item.title}
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                3
              </span>
              Data that may be retained
            </h2>
            <p>Some information may be kept for a limited period after deletion:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Billing / purchase records:</strong> Transaction
                identifiers required for Google Play billing, tax, and fraud prevention — retained
                up to <strong className="text-white">7 years</strong> where legally required, without
                linking to a live account profile when possible.
              </li>
              <li>
                <strong className="text-white">Security & abuse logs:</strong> Aggregated or
                anonymized crash / abuse logs may be retained up to{" "}
                <strong className="text-white">90 days</strong> for integrity and safety.
              </li>
              <li>
                <strong className="text-white">Legal holds:</strong> Data subject to an active legal
                investigation, dispute, or regulatory obligation may be retained until the hold ends.
              </li>
              <li>
                <strong className="text-white">Device-local media:</strong> Projects, drafts, and
                media stored only on your phone are not uploaded for deletion by this web form.
                Clear app storage or uninstall ShotNode to remove local files.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D8FF] border border-[#00D8FF]/30 px-1.5 py-0.5 rounded">
                4
              </span>
              Processing timeline
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Acknowledgement of your request: typically within{" "}
                <strong className="text-white">2 business days</strong>.
              </li>
              <li>
                Full account and personal-data deletion: within{" "}
                <strong className="text-white">30 days</strong> of a verified request (usually sooner).
              </li>
              <li>
                Operator: <strong className="text-white">SECONDBRAIN VENTURES PRIVATE LIMITED</strong>{" "}
                (ShotNode AI).
              </li>
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Submit deletion request</h2>
            <p className="text-sm text-on-surface-variant">
              Use the email tied to your Firebase / Google login in the ShotNode Android app.
            </p>
          </div>

          {formState === "submitted" ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Request drafted</h3>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Your email client should open with a pre-filled deletion request to{" "}
                  <span className="text-white font-mono text-xs">{SUPPORT_EMAIL}</span>. Send that
                  message to complete the request. If it did not open, email us manually with your
                  account address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormState("idle");
                  setConfirmText("");
                  setAcknowledged(false);
                }}
                className="text-xs font-mono text-[#00D8FF] hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="delete-account-email"
                  className="block text-xs font-mono tracking-wider text-on-surface-variant uppercase mb-2"
                >
                  Account email
                </label>
                <input
                  id="delete-account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  className="w-full bg-[#02060C] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#147CFF] focus:ring-1 focus:ring-[#147CFF] transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="delete-account-reason"
                  className="block text-xs font-mono tracking-wider text-on-surface-variant uppercase mb-2"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="delete-account-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Tell us why you're leaving (optional)"
                  className="w-full bg-[#02060C] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#147CFF] focus:ring-1 focus:ring-[#147CFF] transition-all resize-y min-h-[88px]"
                />
              </div>

              <div>
                <label
                  htmlFor="delete-account-confirm"
                  className="block text-xs font-mono tracking-wider text-on-surface-variant uppercase mb-2"
                >
                  Type {CONFIRM_PHRASE} to confirm
                </label>
                <input
                  id="delete-account-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder={CONFIRM_PHRASE}
                  className="w-full bg-[#02060C] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition-all font-mono tracking-widest"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="delete-account-ack"
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 rounded border-white/20 bg-[#02060C] text-[#147CFF] focus:ring-[#147CFF]"
                />
                <span className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  I understand this permanently deletes my ShotNode Firebase account and related
                  personal data, subject to the retention rules described above.
                </span>
              </label>

              {error && (
                <p className="text-sm text-rose-400" role="alert">
                  {error}
                </p>
              )}

              <button
                id="submit-delete-account-btn"
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 py-3.5 px-6 rounded-lg text-sm font-bold text-white transition-all"
              >
                {formState === "submitting" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening email…
                  </span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Request account deletion
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        <section className="space-y-3 border-t border-white/10 pt-8">
          <h2 className="text-lg font-bold text-white tracking-tight">Contact</h2>
          <div className="space-y-2 text-xs leading-relaxed text-on-surface-variant">
            <p className="font-semibold text-white">SECONDBRAIN VENTURES PRIVATE LIMITED</p>
            <p>Seat BS2T4, H-1A/20, Sector 63, Noida, Uttar Pradesh - 201301, India</p>
            <p>
              Account deletion:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#00D8FF] font-mono hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p>
              Related policies:{" "}
              <Link to="/privacy" className="text-[#00D8FF] hover:underline">
                Privacy Policy
              </Link>
              {" · "}
              <Link to="/terms" className="text-[#00D8FF] hover:underline">
                Terms of Service
              </Link>
            </p>
            <p className="pt-2 font-mono text-[11px] text-white/50">
              Play Console URL: https://shotnode.pro/delete-account
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
