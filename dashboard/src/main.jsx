// dashboard/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UssdEmulator from "./components/UssdEmulator.jsx";
import SmsOutbox from "./components/SmsOutbox.jsx";
import Users from "./pages/Users.jsx";
import Analytics from "./pages/Analytics.jsx";

function App(){
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Reform Her — Admin & USSD Demo</h1>

      <section id="ussd" className="grid md:grid-cols-2 gap-6">
        <UssdEmulator shortCode="*500#"/>
        <SmsOutbox />
      </section>

      <section id="users"><Users/></section>
      <section id="analytics"><Analytics/></section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App/>);
