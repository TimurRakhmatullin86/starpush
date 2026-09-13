"use client";

import { useEffect, useState } from "react";

interface ReviewRequest {
  id: string;
  sentAt: string;
  status: string;
  customer: { name: string; phone: string };
  business: { name: string };
  review: {
    rating: number;
    feedbackText: string | null;
    createdAt: string;
  } | null;
}

export default function FeedbackPage() {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/requests")
      .then((r) => r.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  const negative = requests.filter(
    (r) => r.review && r.review.rating <= 3 && r.review.feedbackText
  );

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Negative Feedback</h2>
      <p className="text-gray-500 mb-6">
        These complaints were captured internally and did NOT go to Google.
      </p>

      {negative.length === 0 ? (
        <p className="text-gray-500">No negative feedback yet.</p>
      ) : (
        <div className="space-y-4">
          {negative.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-900">
                    {r.customer.name}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {r.customer.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">
                    {"★".repeat(r.review!.rating)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.review!.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {r.review!.feedbackText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
