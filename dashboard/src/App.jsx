import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Lessons from "./pages/Lessons";
import Users from "./pages/Users";
import Quizzes from "./pages/Quizzes";
import KB from "./pages/KB";
import Certifications from "./pages/Certifications";
import Helpline from "./pages/Helpline";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="w-64 bg-blue-700 text-white flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-6">Reform Her Admin</h1>
        <Link to="/lessons" className="mb-2 hover:underline">Lessons</Link>
        <Link to="/users" className="mb-2 hover:underline">Users</Link>
        <Link to="/quizzes" className="mb-2 hover:underline">Quizzes</Link>
        <Link to="/kb" className="mb-2 hover:underline">Knowledge Base</Link>
        <Link to="/certifications" className="mb-2 hover:underline">Certifications</Link>
        <Link to="/helpline" className="mb-2 hover:underline">Helpline</Link>
        <Link to="/analytics" className="mb-2 hover:underline">Analytics</Link>
      </nav>
      <main className="flex-1">
        <Routes>
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/users" element={<Users />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/kb" element={<KB />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Lessons />} />
        </Routes>
      </main>
    </div>
  );
}