import React from "react";

export default function PhoneFrame({ children, onKeyPress, onSend, onBack, onClear }) {
  return (
    <div className="w-full flex justify-center">
      <div className="phone-frame">
        <div className="phone-top">
          <div className="earpiece" />
        </div>
        <div className="phone-screen">{children}</div>

        <div className="softkeys">
          <button className="softkey" onClick={onBack}>Back</button>
          <button className="softkey primary" onClick={onSend}>Send</button>
        </div>

        <div className="keypad">
          {[
            ["1", ""], ["2", "ABC"], ["3", "DEF"],
            ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
            ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
            ["*", ""], ["0", "+"], ["#", ""],
          ].map(([n, letters]) => (
            <button key={n} className="key" onClick={() => onKeyPress(n)}>
              <span className="num">{n}</span>
              <span className="letters">{letters}</span>
            </button>
          ))}
        </div>

        <div className="utilkeys">
          <button className="util" onClick={onClear}>Clear</button>
        </div>
      </div>
    </div>
  );
}
