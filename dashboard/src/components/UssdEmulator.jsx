// dashboard/src/components/UssdEmulator.jsx
import React, { useMemo, useState } from "react";
import { postForm } from "../lib/api";

export default function UssdEmulator({
  apiBase = "http://localhost:8000", // not used directly; kept for clarity
  sessionId = "demo-001",
  msisdn = "+254700000001",
  shortCode = "*500#",
}) {
  const [text, setText] = useState("");           // the USSD text the user has typed (e.g. "1*2")
  const [screen, setScreen] = useState("");       // gateway response text ("CON ..." | "END ...")
  const [ended, setEnded] = useState(false);      // did we get END ?
  const [busy, setBusy] = useState(false);

  const formEncoded = useMemo(() => {
    const p = new URLSearchParams();
    p.set("sessionId", sessionId);
    p.set("serviceCode", shortCode);
    p.set("phoneNumber", msisdn);
    p.set("text", text);
    return p;
  }, [sessionId, shortCode, msisdn, text]);

  async function send() {
    if (busy) return;
    setBusy(true);
    try {
      const resp = await postForm("/api/ussd", formEncoded);
      setScreen(resp || "");
      setEnded(resp.startsWith("END"));
    } catch (e) {
      setScreen("END Service temporarily unavailable.\nPlease try again.");
      setEnded(true);
    } finally {
      setBusy(false);
    }
  }

  function press(n) {
    setText((prev) => (prev ? `${prev}*${n}` : `${n}`));
  }
  function back() {
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
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">USSD Emulator</h3>
        <div className="text-xs text-slate-600">
          MSISDN: <b>{msisdn}</b> • Code: <b>{shortCode}</b>
        </div>
      </div>

      {/* “Phone” */}
      <div className="mt-3 border rounded-xl p-3 bg-black text-green-200 min-h-[150px] whitespace-pre-wrap text-sm">
        {screen || "Dialing... (press SEND)"}
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={send}
          disabled={busy}
          className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Sending..." : "SEND"}
        </button>
        <button onClick={reset} className="px-3 py-2 bg-slate-200 rounded">RESET</button>
        <button onClick={back} className="px-3 py-2 bg-slate-200 rounded">BACK</button>
        <span className="text-xs text-slate-500 self-center">Typed: {text || "(empty)"}</span>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {["1","2","3","4","5","6","7","8","9","*","0","#"].map((n) => (
          <button
            key={n}
            onClick={() => press(n)}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded shadow text-lg"
          >
            {n}
          </button>
        ))}
      </div>

      {ended && (
        <div className="mt-3 text-amber-600 text-sm">
          Session ended. Press RESET to start again.
        </div>
      )}
    </div>
  );
}
