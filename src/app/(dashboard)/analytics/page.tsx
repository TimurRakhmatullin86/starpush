"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";

interface Stats {
  sent: number;
  opened: number;
  positive: number;
  negative: number;
  conversion: number;
  nps: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="animate-pulse text-gray-400">Loading...</div>;
  }

  const total = stats.positive + stats.negative;
  const openRate =
    stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total SMS Sent" value={stats.sent} />
        <StatCard label="Links Opened" value={stats.opened} />
        <StatCard label="Open Rate" value={openRate} suffix="%" />
        <StatCard label="Positive (4-5★)" value={stats.positive} />
        <StatCard label="Negative (1-3★)" value={stats.negative} />
        <StatCard
          label="Google Conversion"
          value={stats.conversion}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            NPS Score
          </h3>
          <div className="flex items-center gap-4">
            <span
              className={`text-5xl font-bold ${
                stats.nps >= 50
                  ? "text-green-600"
                  : stats.nps >= 0
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {stats.nps}
            </span>
            <div className="text-sm text-gray-500">
              <p>
                {stats.nps >= 50
                  ? "Excellent"
                  : stats.nps >= 0
                    ? "Good"
                    : "Needs improvement"}
              </p>
              <p>{total} total responses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funnel</h3>
          <div className="space-y-3">
            {[
              { label: "SMS Sent", value: stats.sent, color: "bg-blue-500" },
              {
                label: "Opened",
                value: stats.opened,
                color: "bg-indigo-500",
              },
              {
                label: "Responded",
                value: total,
                color: "bg-purple-500",
              },
              {
                label: "Google Reviews",
                value: stats.positive,
                color: "bg-green-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{
                      width: `${
                        stats.sent > 0
                          ? Math.max(
                              (item.value / stats.sent) * 100,
                              item.value > 0 ? 2 : 0
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
