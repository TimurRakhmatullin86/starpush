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

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="animate-pulse text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="SMS Sent" value={stats.sent} />
        <StatCard label="Links Opened" value={stats.opened} />
        <StatCard label="Google Reviews" value={stats.positive} />
        <StatCard label="Negative Feedback" value={stats.negative} />
        <StatCard label="Conversion Rate" value={stats.conversion} suffix="%" />
        <StatCard label="NPS Score" value={stats.nps} />
      </div>
    </div>
  );
}
