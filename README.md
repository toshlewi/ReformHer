# Reform Her — Monorepo

Personalized micro-lessons for women via **USSD (*500#)** and **SMS**, with a React **Admin Dashboard** (USSD emulator, SMS outbox, analytics) and a public **Website**.
Backend uses **Node.js + Express** with **Supabase** (Postgres) as the database.
Optional: AI answers for “Talk to AI” using OpenAI (or the included simple rule engine).

---

## 🗂️ Project Structure

```
REFORM 2/
├── backend/               # Express API (USSD, SMS outbox, users, analytics, AI chat)
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   └── ai.js
│   ├── package.json
│   └── .env               # ← create this
│
├── dashboard/             # Admin dashboard (Vite + React)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── UssdEmulator.jsx
│   │   │   └── SmsOutbox.jsx
│   │   └── pages/
│   │       ├── Lessons.jsx  (placeholder)
│   │       ├── Users.jsx
│   │       ├── Quizzes.jsx  (placeholder)
│   │       ├── KB.jsx       (placeholder)
│   │       ├── Certifications.jsx (placeholder)
│   │       ├── Helpline.jsx
│   │       ├── Analytics.jsx
│   │       └── TalkToAI.jsx
│   ├── package.json
│   └── .env               # ← create this
│
├── website/               # Public marketing site (Vite + React)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── pages/{Home,Privacy,Contact}.jsx
│   ├── package.json
│   └── .env               # ← optional
│
└── README.md
```

---

## 🚀 What’s inside

* **USSD Flow (*500#)**

  * Language-first setup (English / Kiswahili / Français)
  * Digital Skills (your 9 domains), Daily Lessons, Quizzes, Certifications
  * Business Support, Agriculture, Health Tips, Helpline
  * Talk to AI (hands off to SMS for free-text Q&A)

* **Admin Dashboard**

  * **USSD Emulator** (feature-phone UI)
  * **SMS Outbox viewer**
  * **Users list** and **Analytics** (sample KPIs)
  * **Talk to AI** page with **browser speech-to-text** demo

* **Backend API**

  * `POST /api/ussd` — handles USSD menu
  * `GET  /api/sms/outbox` — latest queued SMS
  * `GET  /api/users` — list users
  * `GET  /api/analytics/summary` — metrics
  * `POST /api/ai/chat` — AI chat endpoint (rule-engine + optional OpenAI)

---

## 🧰 Prerequisites

* **Node.js** 18+ (works on 20/22)
* **npm** 8+
* A **Supabase** project (free tier OK)
* (Optional) **OpenAI API key** for richer AI responses

---

## 🗄️ Supabase Setup

1. In **Supabase → Table Editor → SQL**, run these once:

```sql
-- users of the service
create table if not exists users (
  id bigserial primary key,
  msisdn text unique,
  locale text default 'en',
  region text,
  business_type text,
  topics text,
  levels_json text,
  delivery_window text default 'evening',
  consent boolean default true,
  created_at timestamptz default now()
);

-- queued outbound messages (dashboard reads this)
create table if not exists sms_outbox (
  id bigserial primary key,
  msisdn text not null,
  body text not null,
  status text default 'QUEUED',
  created_at timestamptz default now()
);

-- helpline tickets
create table if not exists helpline_tickets (
  id bigserial primary key,
  msisdn text not null,
  topic text,
  notes text,
  status text default 'pending',
  ts timestamptz default now()
);

-- (optional) inbound sms if you later connect a gateway
create table if not exists sms_inbox (
  id bigserial primary key,
  msisdn text not null,
  body text not null,
  created_at timestamptz default now()
);

-- AI chat sessions and messages
create table if not exists ai_sessions (
  id uuid primary key default gen_random_uuid(),
  msisdn text,
  source text default 'dashboard',
  locale text default 'en',
  created_at timestamptz default now()
);

create table if not exists ai_messages (
  id bigserial primary key,
  session_id uuid references ai_sessions(id) on delete cascade,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);
```

2. In **Project Settings → API** copy:

* **Project URL** (e.g., `https://abcxyz.supabase.co`)
* **Service role key** (keep secret — use in backend only)

---

## 🔐 Environment files

Create **`.env`** files as follows.

### `backend/.env`

```
# Express
PORT=8000

# Supabase (server-side secret key)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_KEY=YOUR_SERVICE_ROLE_KEY

# Optional: upgrade AI answers
# OPENAI_API_KEY=sk-xxxx
```

### `dashboard/.env`

```
# Where the backend runs locally
VITE_API_URL=http://localhost:8000
```

### `website/.env` (optional)

```
# Only if the website needs to hit the API (most pages don’t)
VITE_API_URL=http://localhost:8000
```

---

## 📦 Install & Run (local development)

Open **three terminals** (one per app), or run them in tabs.

### 1) Backend API

```bash
cd backend
npm install
npm run dev     # starts Express on http://localhost:8000
```

You should see:

```
API on :8000
```

Health check:

```bash
curl http://localhost:8000/healthz
# {"ok":true}
```

### 2) Admin Dashboard

```bash
cd ../dashboard
npm install
npm run dev     # vite dev server (defaults to 5173)
```

Open: **[http://localhost:5173](http://localhost:5173)**

> First screen should be the **USSD Emulator** (or navigate to `/ussd`).
> Set the **API base** from `.env` if needed.

### 3) Website (public)

```bash
cd ../website
npm install
npm run dev     # vite dev server (defaults to 5174 or 5173 if free)
```

Open: **[http://localhost:5174](http://localhost:5174)** (or the port Vite prints)

---

## 📱 Using the USSD Emulator

1. Open **Dashboard** → **USSD Emulator**
2. Dial `*500#` and **Send**
3. **Language** prompt appears for new numbers
4. Try:

   * `1` → **Digital Skills** → pick a domain (e.g., `1` Basic digital literacy)
   * `2` → **Daily Lessons** (queues an SMS)
   * `9` → **Talk to AI** (sends SMS instruction to ask via “ASK …”)

Check **SMS Outbox** panel/page — messages appear as they’re queued by the backend.

---

## 🧠 “Talk to AI”

* **Via USSD:** choose **9. Talk to AI** → you’ll receive an **SMS** prompt to reply with `ASK: your question`.
  (This is practical because USSD free-text entry is limited.)

* **Via Dashboard:** go to **Talk to AI (voice)** page.

  * Type your question **or** click **Speak 🎤** to use browser **speech-to-text**.
  * The backend uses a **simple rule engine** by default.
  * If you set `OPENAI_API_KEY` in `backend/.env`, answers are upgraded using a compact instructional style.

---

## 🔗 Key API Endpoints (for reference)

* `POST /api/ussd`
  Content-Type: `application/x-www-form-urlencoded`
  Body fields accepted (tolerant):
  `sessionId | session_id`, `serviceCode | service_code`, `phoneNumber | msisdn`, `text`

* `GET /api/sms/outbox?limit=50`

* `GET /api/users`

* `GET /api/analytics/summary`

* `POST /api/ai/chat`

  ```json
  { "text": "How to price bread?", "sessionId": null, "source": "dashboard" }
  ```

---

## 🧩 Common Issues & Fixes

* **Blank dashboard / router errors**
  Ensure `dashboard/package.json` has `react-router-dom` installed:

  ```bash
  cd dashboard && npm i react-router-dom
  ```

* **CORS / API not reachable**
  Confirm `VITE_API_URL` in `dashboard/.env` matches your backend origin (`http://localhost:8000`).
  Restart Vite after changing `.env`.

* **Supabase auth errors**
  Use the **Service Role Key** in `backend/.env` (not anon key). Backend never exposes it to the browser.

* **OpenAI disabled**
  If `OPENAI_API_KEY` is missing, the backend falls back to the built-in rule engine.

---

## 🧪 Demo Scenarios

* **Registration (language-first):**
  New MSISDN → prompts language → lands on main menu.

* **Digital Skills (USSD → SMS):**
  `*500#` → `1` → pick any (e.g., `2` Mobile finance & records) → **SMS** tip is queued.

* **Helpline:**
  `*500#` → `8` → ticket created in `helpline_tickets`, confirmation SMS queued.

* **Analytics:**
  Dashboard → **Analytics** shows total users, quiz count (from `sms_outbox` that include “Quiz:”).

---

## 🏗️ Production Notes (later)

* Host **backend** on a server (or Render, Railway), set `PORT` and env keys.
* Build **dashboard** and **website** (Vite):

  ```bash
  npm run build
  npm run preview
  ```
* Use a real **USSD/SMS aggregator** (Africa’s Talking, Twilio, etc.) and wire their webhooks to your backend.

---

## 📄 License & Credits

Prototyped for **ITC (ILO) Hackathon** challenge: inclusive upskilling for women where connectivity is limited.
Design language: soft rose & amber for warmth, teal & purple for “bridging barriers”.

---

## 🤝 Support

If you get stuck, share:

* The command you ran
* Terminal output (errors)
* Browser console/network logs (for dashboard)

Happy building — and good luck winning the hackathon! ✨
