import React, { useMemo, useState } from "react";

const padBtn = "px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded shadow text-lg";

export default function UssdEmulator({
  apiBase = "http://localhost:8000",
  sessionId = "demo123",
  msisdn = "+254700000001",
  shortCode = "*123#",
}) {
  const [text, setText] = useState("");      // the running "1*2*3"
  const [screen, setScreen] = useState("");  // last response from server
  const [ended, setEnded] = useState(false);

  const body = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sessionId", sessionId);
    params.set("serviceCode", shortCode);
    params.set("phoneNumber", msisdn);
    params.set("text", text);
    return params.toString();
  }, [sessionId, shortCode, msisdn, text]);

  async function send() {
    const r = await fetch(`${apiBase}/api/ussd`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const t = await r.text();
    setScreen(t);
    setEnded(t.startsWith("END"));
  }

  function press(n) {
    const next = text ? `${text}*${n}` : `${n}`;
    setText(next);
  }
  function backspace() {
    const parts = text.split("*").filter(Boolean);
    parts.pop();
    setText(parts.join("*"));
  }
  function reset() {
    setText("");
    setScreen("");
    setEnded(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">USSD Emulator</h3>
        <div className="border rounded p-3 bg-black text-green-200 min-h-[140px] whitespace-pre-wrap">
          {screen || "Dialing... (press SEND)"}
        </div>

        <div className="mt-3">
          <div className="text-xs text-slate-600">Payload: <code>{text || "(empty)"}</code></div>
          <div className="mt-2 flex gap-2">
            <button onClick={send} className="px-3 py-2 bg-indigo-600 text-white rounded">SEND</button>
            <button onClick={reset} className="px-3 py-2 bg-slate-200 rounded">RESET</button>
            <button onClick={backspace} className="px-3 py-2 bg-slate-200 rounded">BACK</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {["1","2","3","4","5","6","7","8","9","*","0","#"].map(n => (
            <button key={n} onClick={() => press(n)} className={padBtn}>{n}</button>
          ))}
        </div>
        {ended && <div className="mt-3 text-amber-600 text-sm">Session ended. Press RESET to start again.</div>}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("")}>Home</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("1")}>1. Register/Update</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("2")}>2. Learn Now</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("3")}>3. Quiz & Progress</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("4")}>4. Ask ReformHer</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("5")}>5. Certifications</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("6")}>6. Business Help</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("7")}>7. Agriculture (Region)</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("8")}>8. Helpline</button>
          <button className="px-3 py-2 bg-slate-100 rounded" onClick={()=>setText("9")}>9. Settings</button>
        </div>

        <p className="mt-4 text-slate-600 text-sm">
          Tip: Click a quick action, then press <b>SEND</b>. Use the keypad (1..9, 0, *) to follow the prompts exactly like USSD.
        </p>
      </div>
    </div>
  );
}
