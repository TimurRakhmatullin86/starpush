"use client";

import { useEffect, useState } from "react";

interface ReviewRequest {
  id: string;
  sentAt: string;
  status: string;
  customer: { name: string; phone: string };
  business: { name: string };
  review: { rating: number; wentToGoogle: boolean; createdAt: string } | null;
}

export default function ReviewsPage() {
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

  const reviewed = requests.filter((r) => r.review && r.review.rating >= 4);

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
      {reviewed.length === 0 ? (
        <p className="text-gray-500">No positive reviews yet. Send SMS to start collecting!</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Business</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4">Google?</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviewed.map((r) => (
                <tr key={r.id}>
                  <td className="p-4 font-medium text-gray-900">{r.customer.name}</td>
                  <td className="p-4 text-gray-600">{r.business.name}</td>
                  <td className="p-4">
                    {"★".repeat(r.review!.rating)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - r.review!.rating)}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.review!.wentToGoogle ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(r.review!.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
