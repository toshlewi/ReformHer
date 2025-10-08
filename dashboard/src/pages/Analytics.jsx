import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/summary`);
        const json = await res.json();
        if (alive) setData(json);
      } catch {
        if (alive) setData(null);
      }
    };
    load();
    const t = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Analytics</h2>
      {!data ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded bg-slate-50">
              Users
              <br />
              <b>{data.totalUsers}</b>
            </div>
            <div className="p-3 rounded bg-slate-50">
              Quiz Attempts
              <br />
              <b>{data.quizCount}</b>
            </div>
            <div className="p-3 rounded bg-slate-50">
              Avg Score
              <br />
              <b>{data.avgScore}</b>
            </div>
          </div>

          {Array.isArray(data.byTopic) && data.byTopic.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">By Topic</div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {data.byTopic.map((t, i) => (
                  <div key={i} className="p-3 rounded bg-slate-50">
                    {t.topic}
                    <br />
                    <b>{t.c}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
