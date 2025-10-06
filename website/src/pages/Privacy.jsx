import React from "react";
import { Link } from "react-router-dom";

export default function Privacy(){
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      <section className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy & Consent</h1>
        <p className="mt-2 text-slate-700">
          We respect your privacy. Reform Her collects the minimum data needed to personalize your learning and keep you safe.
        </p>

        <div className="mt-6 space-y-6">
          <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
            <h2 className="font-semibold text-slate-900">What we collect</h2>
            <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc ml-6">
              <li>Phone number (MSISDN), language, region/county</li>
              <li>Chosen topics (e.g., health, business, agriculture)</li>
              <li>Delivery window (e.g., evening) and quiz outcomes</li>
              <li>Helpline requests (if you ask for a call back)</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
            <h2 className="font-semibold text-slate-900">How we use it</h2>
            <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc ml-6">
              <li>Personalize daily lessons and tips in your language</li>
              <li>Improve content using quiz feedback (aggregated)</li>
              <li>Connect you to support or referrals if you request help</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
            <h2 className="font-semibold text-slate-900">Your choices</h2>
            <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc ml-6">
              <li>Opt out any time (send <b>STOP</b> via SMS or update via USSD)</li>
              <li>Request the data we hold about you</li>
              <li>Report inaccuracies and request corrections</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
            <h2 className="font-semibold text-slate-900">Retention & security</h2>
            <p className="mt-2 text-sm text-slate-700">
              We retain only while you’re enrolled and for limited audit purposes.
              Data is stored securely and access is restricted to authorized staff.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
            <h2 className="font-semibold text-slate-900">Contact</h2>
            <p className="mt-2 text-sm text-slate-700">
              Questions? <Link to="/contact" className="text-rose-700 underline">Contact us</Link>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
