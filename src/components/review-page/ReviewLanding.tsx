"use client";

import { useState } from "react";
import StarRating from "./StarRating";

interface Props {
  requestId: string;
  customerName: string;
  businessName: string;
  businessLogo?: string | null;
  googleReviewUrl?: string | null;
}

type Phase = "rate" | "google" | "feedback" | "thanks";

export default function ReviewLanding({
  requestId,
  customerName,
  businessName,
  businessLogo,
  googleReviewUrl,
}: Props) {
  const [phase, setPhase] = useState<Phase>("rate");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRate(rating: number) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, rating }),
      });
      const data = await res.json();
      if (rating >= 4 && data.googleReviewUrl) {
        setPhase("google");
        setTimeout(() => {
          window.open(data.googleReviewUrl, "_blank");
        }, 500);
      } else if (rating >= 4) {
        setPhase("google");
      } else {
        setPhase("feedback");
      }
    } catch {
      setPhase(rating >= 4 ? "google" : "feedback");
    }
    setSubmitting(false);
  }

  async function handleFeedback() {
    if (!feedback.trim()) return;
    setSubmitting(true);
    await fetch("/api/feedback/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, feedbackText: feedback }),
    });
    setPhase("thanks");
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md text-center py-12">
        {businessLogo && (
          <img
            src={businessLogo}
            alt={businessName}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {businessName}
        </h1>

        {phase === "rate" && (
          <div className="mt-8">
            <p className="text-lg text-gray-700 mb-6">
              Hi {customerName}! How was your visit?
            </p>
            <StarRating onRate={handleRate} />
            {submitting && (
              <p className="mt-4 text-gray-500 text-sm">Submitting...</p>
            )}
          </div>
        )}

        {phase === "google" && (
          <div className="mt-8 animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg text-gray-700 mb-6">
              Glad you had a great experience! Would you mind sharing it on
              Google? It really helps us.
            </p>
            {googleReviewUrl && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Leave a Google Review ⭐
              </a>
            )}
            <p className="mt-4 text-sm text-gray-400">
              Thank you for your support!
            </p>
          </div>
        )}

        {phase === "feedback" && (
          <div className="mt-8 animate-fade-in">
            <p className="text-lg text-gray-700 mb-4">
              We&apos;re sorry to hear that. Tell us what happened — we want to
              make it right.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What could we improve?"
              className="w-full p-4 border border-gray-300 rounded-xl text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <button
              onClick={handleFeedback}
              disabled={submitting || !feedback.trim()}
              className="mt-4 w-full bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Feedback"}
            </button>
          </div>
        )}

        {phase === "thanks" && (
          <div className="mt-8 animate-fade-in">
            <div className="text-6xl mb-4">🙏</div>
            <p className="text-lg text-gray-700">
              Thank you for your feedback. We&apos;ll work on improving!
            </p>
          </div>
        )}

        <p className="mt-12 text-xs text-gray-300">Powered by StarPush</p>
      </div>
    </div>
  );
}
