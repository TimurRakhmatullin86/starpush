"use client";

import { useEffect, useState } from "react";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    features: ["10 SMS/month", "1 location", "Basic analytics"],
  },
  {
    key: "starter",
    name: "Starter",
    price: 19,
    features: ["100 SMS/month", "1 location", "Full analytics", "CSV import"],
    popular: true,
  },
  {
    key: "growth",
    name: "Growth",
    price: 39,
    features: ["500 SMS/month", "3 locations", "Full analytics", "CSV import", "Priority support"],
  },
  {
    key: "pro",
    name: "Pro",
    price: 69,
    features: [
      "Unlimited SMS",
      "Unlimited locations",
      "Full analytics",
      "CSV import",
      "White-label",
      "Priority support",
    ],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  async function handleUpgrade(plan: string) {
    if (plan === "free" || plan === currentPlan) return;
    setLoading(plan);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();

    if (data.url) {
      window.location.assign(data.url);
    }
    setLoading(null);
  }

  async function handleManage() {
    setLoading("manage");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);
    }
    setLoading(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
        {currentPlan !== "free" && (
          <button
            onClick={handleManage}
            disabled={loading !== null}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            Manage Subscription
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`bg-white rounded-xl border-2 p-6 ${
              plan.popular
                ? "border-blue-500 shadow-lg"
                : "border-gray-200"
            } ${currentPlan === plan.key ? "ring-2 ring-green-500" : ""}`}
          >
            {plan.popular && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              {plan.name}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${plan.price}
              <span className="text-sm font-normal text-gray-500">
                /month
              </span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.key)}
              disabled={
                plan.key === "free" ||
                currentPlan === plan.key ||
                loading !== null
              }
              className={`w-full mt-6 py-2 rounded-lg font-medium text-sm ${
                currentPlan === plan.key
                  ? "bg-green-100 text-green-700"
                  : plan.key === "free"
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
              } disabled:opacity-50`}
            >
              {currentPlan === plan.key
                ? "Current Plan"
                : loading === plan.key
                  ? "Redirecting..."
                  : plan.key === "free"
                    ? "Free"
                    : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
