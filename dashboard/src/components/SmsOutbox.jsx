// dashboard/src/components/SmsOutbox.jsx
import React, { useEffect, useState } from "react";
import { getJson } from "../lib/api";

export default function SmsOutbox() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await getJson("/api/sms/outbox?limit=50");
      setRows(data.messages || []);
    } catch (e) {
      setErr("Failed to load SMS outbox.");
      setRows([]);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">SMS Outbox (latest)</h3>
        <button onClick={load} className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200">
          Refresh
        </button>
      </div>
      {err && <div className="text-rose-700 text-sm mt-2">{err}</div>}

      {!rows ? (
        <p className="text-sm text-slate-600 mt-3">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-600 mt-3">No messages yet.</p>
      ) : (
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="text-left">
              <th className="py-1">Time</th>
              <th>To</th>
              <th>Body</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="py-1">{new Date(m.created_at).toLocaleString()}</td>
                <td>{m.msisdn}</td>
                <td className="max-w-[420px] truncate" title={m.body}>{m.body}</td>
                <td>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
