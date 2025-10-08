import React, { useEffect, useState } from "react";
import { fetchUsers } from "../lib/api";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const users = await fetchUsers(200);
      setRows(users);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // gentle auto-refresh
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Users</h2>

      {loading && !rows.length ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : !rows.length ? (
        <p className="text-sm text-slate-600">No users yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-1">MSISDN</th>
              <th>Locale</th>
              <th>Region</th>
              <th>Biz</th>
              <th>Topics</th>
              <th>Time</th>
              <th>Consent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-1">{u.msisdn}</td>
                <td>{u.locale}</td>
                <td>{u.region}</td>
                <td>{u.business_type}</td>
                <td>{u.topics}</td>
                <td>{u.delivery_window}</td>
                <td>{u.consent ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3">
        <button className="btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
    </div>
  );
}
