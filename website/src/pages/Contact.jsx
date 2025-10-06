import React, { useState } from "react";

export default function Contact(){
  const [sent, setSent] = useState(false);

  function submit(e){
    e.preventDefault();
    // For demo: pretend we sent it. Hook this to your backend later.
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <section className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Contact & Partnerships</h1>
        <p className="mt-2 text-slate-700">
          We collaborate with community groups, NGOs, county governments, and micro-finance partners.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={submit} className="bg-white rounded-2xl p-5 shadow border border-rose-100">
            <div className="grid gap-3">
              <label className="text-sm">
                Name
                <input required type="text" className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </label>
              <label className="text-sm">
                Email
                <input required type="email" className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </label>
              <label className="text-sm">
                Phone (optional)
                <input type="tel" className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </label>
              <label className="text-sm">
                Message
                <textarea rows={5} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Tell us about your community and goals…" />
              </label>
              <button className="mt-2 rounded-xl bg-rose-600 px-5 py-3 text-white font-semibold shadow hover:bg-rose-700" type="submit">
                Send
              </button>
              {sent && <div className="text-emerald-700 text-sm">Thanks! We’ll get back to you shortly.</div>}
            </div>
          </form>

          {/* Details */}
          <aside className="rounded-2xl bg-white p-5 shadow border border-amber-100">
            <h2 className="font-semibold text-slate-900">Other ways to reach us</h2>
            <ul className="mt-2 text-sm text-slate-700 space-y-2">
              <li>📧 Email: <a className="text-rose-700 underline" href="mailto:hello@reformher.example">hello@reformher.example</a></li>
              <li>☎ Helpline (pilot): <span className="font-semibold">request a call back via USSD → 8 → 1</span></li>
              <li>🏷 Social: @reformher (coming soon)</li>
              <li>🏢 Nairobi, Kenya (regional partners across Africa)</li>
            </ul>

            <div className="mt-5 rounded-xl overflow-hidden ring-1 ring-rose-100">
              <img
                src="https://source.unsplash.com/1200x800/?africa,community,meeting"
                alt="Community meeting"
                className="w-full object-cover"
                loading="lazy"
              />
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Photos are placeholders; please replace with your media before the demo day.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
