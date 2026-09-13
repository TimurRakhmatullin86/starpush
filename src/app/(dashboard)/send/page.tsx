"use client";

import { useEffect, useState, useRef } from "react";

interface Business {
  id: string;
  name: string;
}

export default function SendPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [csvData, setCsvData] = useState<{ name: string; phone: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((data) => {
        setBusinesses(data);
        if (data.length > 0) setSelectedBiz(data[0].id);
      });
  }, []);

  async function handleSendSingle(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);

    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: selectedBiz,
        customerName: name,
        customerPhone: phone,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "SMS sent successfully!" });
      setName("");
      setPhone("");
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "Failed to send" });
    }
    setSending(false);
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const rows: { name: string; phone: string }[] = [];
      for (const line of lines.slice(1)) {
        const parts = line.split(",").map((s) => s.trim().replace(/"/g, ""));
        if (parts.length >= 2) {
          rows.push({ name: parts[0], phone: parts[1] });
        }
      }
      setCsvData(rows);
    };
    reader.readAsText(file);
  }

  async function handleBulk() {
    if (csvData.length === 0) return;
    setSending(true);
    setMessage(null);

    const res = await fetch("/api/sms/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: selectedBiz, customers: csvData }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({
        type: "success",
        text: `Sent ${data.sent}/${data.total} SMS successfully`,
      });
      setCsvData([]);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setMessage({ type: "error", text: data.error || "Bulk send failed" });
    }
    setSending(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Send SMS</h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {businesses.length === 0 ? (
        <p className="text-gray-500">
          Add a business in Settings first.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business
            </label>
            <select
              value={selectedBiz}
              onChange={(e) => setSelectedBiz(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Single SMS
              </h3>
              <form onSubmit={handleSendSingle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Review Request"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bulk Send (CSV)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload a CSV with columns: name, phone
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleCSV}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
              />
              {csvData.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {csvData.length} customers loaded
                  </p>
                  <button
                    onClick={handleBulk}
                    disabled={sending}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? "Sending..." : `Send ${csvData.length} SMS`}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
