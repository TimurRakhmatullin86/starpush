"use client";

import { useEffect, useState } from "react";

interface Business {
  id: string;
  name: string;
  googlePlaceId: string | null;
  googleReviewUrl: string | null;
  phone: string | null;
  smsTemplate: string | null;
  delayHours: number;
  logoUrl: string | null;
}

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editing, setEditing] = useState<Business | null>(null);
  const [newBiz, setNewBiz] = useState(false);
  const [form, setForm] = useState({
    name: "",
    googleReviewUrl: "",
    phone: "",
    smsTemplate: "",
    delayHours: 2,
  });
  const [message, setMessage] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<
    { placeId: string; name: string; address: string; reviewUrl: string }[]
  >([]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  function loadBusinesses() {
    fetch("/api/business")
      .then((r) => r.json())
      .then(setBusinesses);
  }

  async function searchPlaces() {
    if (!placeQuery) return;
    const res = await fetch(
      `/api/places/search?q=${encodeURIComponent(placeQuery)}`
    );
    const data = await res.json();
    setPlaces(data);
  }

  async function handleSave() {
    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { id: editing.id, ...form }
      : form;

    const res = await fetch("/api/business", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage("Saved!");
      setEditing(null);
      setNewBiz(false);
      loadBusinesses();
    }
  }

  function startEdit(biz: Business) {
    setEditing(biz);
    setNewBiz(false);
    setForm({
      name: biz.name,
      googleReviewUrl: biz.googleReviewUrl || "",
      phone: biz.phone || "",
      smsTemplate: biz.smsTemplate || "",
      delayHours: biz.delayHours,
    });
  }

  function startNew() {
    setEditing(null);
    setNewBiz(true);
    setForm({
      name: "",
      googleReviewUrl: "",
      phone: "",
      smsTemplate: "",
      delayHours: 2,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <button
          onClick={startNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Business
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {businesses.length > 0 && !newBiz && !editing && (
        <div className="space-y-3 mb-6">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{biz.name}</p>
                <p className="text-sm text-gray-500">
                  {biz.googleReviewUrl ? "Google link set" : "No Google link"}{" "}
                  &middot; Delay: {biz.delayHours}h
                </p>
              </div>
              <button
                onClick={() => startEdit(biz)}
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {(newBiz || editing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Review URL
            </label>
            <input
              type="url"
              value={form.googleReviewUrl}
              onChange={(e) =>
                setForm({ ...form, googleReviewUrl: e.target.value })
              }
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="Search Google Places..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={searchPlaces}
                type="button"
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Search
              </button>
            </div>

            {places.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg divide-y">
                {places.map((p) => (
                  <button
                    key={p.placeId}
                    onClick={() => {
                      setForm({ ...form, googleReviewUrl: p.reviewUrl });
                      setPlaces([]);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 text-sm"
                  >
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS Template
            </label>
            <textarea
              value={form.smsTemplate}
              onChange={(e) =>
                setForm({ ...form, smsTemplate: e.target.value })
              }
              placeholder="Hi {name}! Thanks for choosing {business}. Your opinion matters: {link}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              Variables: {"{name}"}, {"{business}"}, {"{link}"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay (hours after visit)
            </label>
            <input
              type="number"
              value={form.delayHours}
              onChange={(e) =>
                setForm({ ...form, delayHours: parseInt(e.target.value) || 2 })
              }
              min={0}
              max={48}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setNewBiz(false);
              }}
              className="text-gray-600 px-4 py-2 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
