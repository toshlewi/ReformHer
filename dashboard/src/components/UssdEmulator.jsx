import React, { useEffect, useMemo, useState } from "react";
import PhoneFrame from "./PhoneFrame";
import { postUssd, fetchOutbox } from "../lib/api";

function randomSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function UssdEmulator() {
  const [phoneNumber, setPhoneNumber] = useState("254700000001");
  const [sessionId, setSessionId] = useState(randomSessionId());
  const [input, setInput] = useState("");
  const [screen, setScreen] = useState("");
  const [isEnd, setIsEnd] = useState(false);
  const [smsInbox, setSmsInbox] = useState([]);

  // poll SMS outbox for this MSISDN
  useEffect(() => {
    let timer;
    const load = async () => {
      const all = await fetchOutbox(50);
      setSmsInbox(all.filter(m => m.msisdn === phoneNumber));
    };
    load();
    timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [phoneNumber]);

  const prettyScreen = useMemo(() => {
    if (!screen) return "";
    if (screen.startsWith("CON ")) return screen.replace(/^CON /, "");
    if (screen.startsWith("END ")) return screen.replace(/^END /, "");
    return screen;
  }, [screen]);

  const dial = async () => {
    const resp = await postUssd({ sessionId, phoneNumber, text: "" });
    setScreen(resp);
    setIsEnd(resp.startsWith("END "));
    setInput("");
  };

  const send = async () => {
    const resp = await postUssd({ sessionId, phoneNumber, text: input });
    setScreen(resp);
    setIsEnd(resp.startsWith("END "));
    if (resp.startsWith("END ")) {
      setTimeout(() => {
        setSessionId(randomSessionId());
        setInput("");
      }, 600);
    }
  };

  const back = () => {
    const parts = input.split("*").filter(Boolean);
    parts.pop();
    setInput(parts.join("*"));
  };

  const clear = () => setInput("");
  const handleKey = (k) => setInput(prev => prev + k);
  const quickFill = (value) => setInput(value);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium">MSISDN</div>
        <input
          className="input"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="2547XXXXXXXX"
        />
        <button className="btn" onClick={dial}>Dial *500#</button>
        <button className="btn-secondary"
          onClick={() => { setSessionId(randomSessionId()); setScreen(""); setInput(""); setIsEnd(false); }}>
          Reset session
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PhoneFrame onKeyPress={handleKey} onSend={send} onBack={back} onClear={clear}>
            <div className="screen-content">
              <div className="screen-header">
                <span className="carrier">Reform Her</span>
                <span className="signal">📶</span>
              </div>
              <div className="screen-body">
                <pre className="screen-text">{screen ? prettyScreen : "Press Dial to start (*500#)"}</pre>
              </div>
              <div className="screen-input">
                <div className="input-label">Text</div>
                <div className="input-value">{input || <span className="muted">—</span>}</div>
              </div>
              <div className="screen-softkeys">
                <span>Back</span>
                <span className="primary">{isEnd ? "Close" : "Send"}</span>
              </div>
            </div>
          </PhoneFrame>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="chip" onClick={() => quickFill("1")}>1 (Register)</button>
            <button className="chip" onClick={() => quickFill("1*1")}>1*1 (Lang → English)</button>
            <button className="chip" onClick={() => quickFill("1*1*1")}>1*1*1 (Region → Nairobi)</button>
            <button className="chip" onClick={() => quickFill("2")}>2 (Lesson)</button>
            <button className="chip" onClick={() => quickFill("3")}>3 (Quiz)</button>
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="card-title">SMS Inbox (for {phoneNumber})</div>
            <div className="divide-y">
              {smsInbox.length === 0 && (
                <div className="p-3 text-sm text-slate-500">No SMS yet. Complete a flow to receive one.</div>
              )}
              {smsInbox.map((m) => (
                <div key={m.id} className="p-3">
                  <div className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</div>
                  <div className="font-medium text-slate-800">{m.body}</div>
                  <div className="text-xs text-slate-500 mt-1">Status: {m.status}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
