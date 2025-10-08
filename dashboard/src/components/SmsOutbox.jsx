import React, { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SmsOutbox({ limit = 50 }) {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const loadingRef = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (loadingRef.current) return; // prevent overlapping calls
      loadingRef.current = true;
      setError("");

      // cancel any in-flight request before starting a new one
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/sms/outbox?limit=${limit}`, {
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setMessages(json.messages || []);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Outbox fetch failed:", e);
          setError("Failed to load outbox.");
        }
      } finally {
        loadingRef.current = false;
      }
    }

    // visibility-aware polling (pause when tab is hidden)
    const startPolling = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (document.visibilityState === "visible") load();
      }, 2000);
    };

    load();
    startPolling();

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [limit]);

  return (
    <div className="card">
      <div className="card-title">SMS Outbox (latest {limit})</div>
      <div className="divide-y">
        {error && (
          <div className="p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {messages.length === 0 && !error && (
          <div className="p-3 text-sm text-slate-500">
            No messages yet. Perform an action in the USSD emulator (e.g., Register) to queue SMS.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="p-3">
            <div className="text-xs text-slate-400">
              {new Date(m.created_at).toLocaleString()} • {m.msisdn}
            </div>
            <div className="font-medium text-slate-800">{m.body}</div>
            <div className="text-xs text-slate-500 mt-1">Status: {m.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
