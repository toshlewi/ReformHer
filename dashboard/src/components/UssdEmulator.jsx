import React, { useMemo, useState } from "react";

export default function UssdEmulator({ apiBase="http://localhost:8000", sessionId="demo123", msisdn="+254700000001", shortCode="*123#" }){
  const [text,setText]=useState(""), [screen,setScreen]=useState(""), [ended,setEnded]=useState(false);
  const body = useMemo(()=>{ const p=new URLSearchParams(); p.set("sessionId",sessionId); p.set("serviceCode",shortCode); p.set("phoneNumber",msisdn); p.set("text",text); return p.toString(); },[sessionId,shortCode,msisdn,text]);
  async function send(){ const r=await fetch(`${apiBase}/api/ussd`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body}); const t=await r.text(); setScreen(t); setEnded(t.startsWith("END")); }
  function press(n){ setText(text?`${text}*${n}`:`${n}`); }
  function back(){ const parts=text.split("*").filter(Boolean); parts.pop(); setText(parts.join("*")); }
  function reset(){ setText(""); setScreen(""); setEnded(false); }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">USSD Emulator</h3>
      <div className="border rounded p-3 bg-black text-green-200 min-h-[140px] whitespace-pre-wrap">{screen||"Dialing... (press SEND)"}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={send} className="px-3 py-2 bg-indigo-600 text-white rounded">SEND</button>
        <button onClick={reset} className="px-3 py-2 bg-slate-200 rounded">RESET</button>
        <button onClick={back} className="px-3 py-2 bg-slate-200 rounded">BACK</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {["1","2","3","4","5","6","7","8","9","*","0","#"].map(n=>(
          <button key={n} onClick={()=>press(n)} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded shadow text-lg">{n}</button>
        ))}
      </div>
      {ended && <div className="mt-3 text-amber-600 text-sm">Session ended. Press RESET to start again.</div>}
    </div>
  );
}
