import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Helpline() {
  const [rows, setRows] = useState([]);

  const load = () =>
    fetch(`${API_BASE}/api/helpline`)
      .then((r) => r.json())
      .then((d) => setRows(d.tickets || []))
      .catch(() => setRows([]));

  useEffect(() => {
    load();
  }, []);

  async function closeTicket(id) {
    await fetch(`${API_BASE}/api/helpline/close`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Helpline Queue</h2>
      {!rows.length ? (
        <p className="text-sm text-slate-600">No tickets yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-1">ID</th>
              <th>MSISDN</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-1">{r.id}</td>
                <td>{r.msisdn}</td>
                <td>{r.topic}</td>
                <td>{r.status}</td>
                <td>{r.ts ? new Date(r.ts).toLocaleString() : "-"}</td>
                <td>
                  {r.status !== "closed" && (
                    <button
                      onClick={() => closeTicket(r.id)}
                      className="px-2 py-1 bg-emerald-600 text-white rounded"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-xs text-slate-500 mt-2">
        Create tickets from USSD → 8 (Helpline) → 1 (Call me back).
      </p>
    </div>
  );
}
