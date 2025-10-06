import React, { useEffect, useState } from "react";

export default function Users(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ fetch("http://localhost:8000/api/users").then(r=>r.json()).then(d=>setRows(d.users||[])); },[]);
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Users</h2>
      {!rows.length ? <p className="text-sm text-slate-600">No users yet. Register via USSD demo (1 → follow prompts).</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th className="py-1">MSISDN</th><th>Locale</th><th>Region</th><th>Biz</th><th>Topics</th><th>Time</th><th>Consent</th></tr></thead>
          <tbody>
            {rows.map(u=>(
              <tr key={u.id} className="border-t">
                <td className="py-1">{u.msisdn}</td>
                <td>{u.locale}</td>
                <td>{u.region}</td>
                <td>{u.business_type}</td>
                <td>{u.topics}</td>
                <td>{u.delivery_window}</td>
                <td>{u.consent ? "Yes":"No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
