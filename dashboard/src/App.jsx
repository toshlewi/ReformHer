// dashboard/src/App.jsx
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";

import Lessons from "./pages/Lessons";
import Users from "./pages/Users";
import Quizzes from "./pages/Quizzes";
import KB from "./pages/KB";
import Certifications from "./pages/Certifications";
import Helpline from "./pages/Helpline";
import Analytics from "./pages/Analytics";
import UssdEmulator from "./components/UssdEmulator";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LinkItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `mb-2 rounded px-3 py-2 transition-colors ${
        isActive
          ? "bg-white/20 text-white"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function App() {
  const envLabel = (() => {
    try {
      const u = new URL(API_BASE);
      return u.hostname === "localhost" ? "localhost" : u.hostname;
    } catch {
      return "unknown";
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Reform Her</h1>
          <div className="text-blue-100 text-sm -mt-0.5">Admin Dashboard</div>
        </div>

        <div className="flex flex-col">
          <div className="text-blue-200 text-xs uppercase tracking-wider mb-2">
            USSD & Messaging
          </div>
          <LinkItem to="/ussd">USSD Emulator</LinkItem>

          <div className="text-blue-200 text-xs uppercase tracking-wider mt-4 mb-2">
            Content & Users
          </div>
          <LinkItem to="/lessons">Lessons</LinkItem>
          <LinkItem to="/quizzes">Quizzes</LinkItem>
          <LinkItem to="/kb">Knowledge Base</LinkItem>
          <LinkItem to="/users">Users</LinkItem>

          <div className="text-blue-200 text-xs uppercase tracking-wider mt-4 mb-2">
            Outcomes
          </div>
          <LinkItem to="/certifications">Certifications</LinkItem>
          <LinkItem to="/helpline">Helpline</LinkItem>
          <LinkItem to="/analytics">Analytics</LinkItem>
        </div>

        <div className="mt-auto pt-4 text-xs text-blue-200/80">
          *500# • Supabase • Local dev
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-4">
          <div className="font-semibold text-slate-700">Reform Her — Admin</div>
          <div className="text-xs text-slate-500">
            Env: <span className="font-mono">{envLabel}</span>
          </div>
        </header>

        {/* Routes */}
        <div className="p-4">
          <Routes>
            {/* New USSD route */}
            <Route path="/ussd" element={<UssdEmulator />} />

            {/* Existing pages */}
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/users" element={<Users />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/kb" element={<KB />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/helpline" element={<Helpline />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Default route → USSD Emulator for convenience */}
            <Route path="*" element={<UssdEmulator />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
