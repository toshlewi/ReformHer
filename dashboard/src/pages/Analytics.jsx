import React, { useEffect, useState } from "react";
export default function Analytics(){
  const [data,setData]=useState(null);
  useEffect(()=>{ fetch("http://localhost:8000/api/analytics/summary").then(r=>r.json()).then(setData).catch(()=>setData(null)); },[]);
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Analytics</h2>
      {!data ? <p className="text-sm text-slate-600">Loading…</p> :
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded bg-slate-50">Users<br/><b>{data.totalUsers}</b></div>
          <div className="p-3 rounded bg-slate-50">Quiz Attempts<br/><b>{data.quizCount}</b></div>
          <div className="p-3 rounded bg-slate-50">Avg Score<br/><b>{data.avgScore}</b></div>
        </div>}
    </div>
  );
}
