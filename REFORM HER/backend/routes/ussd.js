import express from "express";
import { get, run } from "../db.js";
import { upsertUser, getUser } from "../models/user.js";
import { con, end, parseText, MENU, trim160, pick } from "../utils/ussdHelpers.js";
import fetch from "node-fetch";

const router = express.Router();

// Simple in-DB session helpers
function saveSession(sessionId, state, payload = {}) {
  const row = get("SELECT session_id FROM sessions WHERE session_id=?", [sessionId]);
  const payload_json = JSON.stringify(payload);
  if (row) {
    run("UPDATE sessions SET state=?, payload_json=?, updated_at=CURRENT_TIMESTAMP WHERE session_id=?",
      [state, payload_json, sessionId]);
  } else {
    run("INSERT INTO sessions(session_id, state, payload_json) VALUES (?, ?, ?)",
      [sessionId, state, payload_json]);
  }
}

function loadSession(sessionId) {
  const row = get("SELECT * FROM sessions WHERE session_id=?", [sessionId]);
  if (!row) return { state: "HOME", payload: {} };
  return { state: row.state, payload: JSON.parse(row.payload_json || "{}") };
}

const LANGS = ["en","sw","fr"];
const TOPIC_MAP = { "1":"medical","2":"business","3":"agri","4":"all" };
const BIZ_TYPES = ["kiosk","tailoring","food","beauty","retail","services"];
const TIMES = ["morning","afternoon","evening"];

router.post("/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body || {};
  const inputs = parseText(text);
  const { state, payload } = loadSession(sessionId);

  // Home when empty input
  if (inputs.length === 0) {
    saveSession(sessionId, "HOME");
    return res.send(con(`Welcome to Reform Her\n${MENU.HOME}`));
  }

  // Parse first choice (main menu)
  const choice = inputs[0];

  // 1 Register/Update
  if (choice === "1") {
    if (inputs.length === 1) {
      saveSession(sessionId, "REG_LANG");
      return res.send(con("Choose language:\n1 EN 2 SW 3 FR"));
    }
    if (inputs.length === 2) {
      const langIdx = parseInt(inputs[1],10);
      payload.locale = LANGS[langIdx-1] || "en";
      saveSession(sessionId, "REG_TOPICS", payload);
      return res.send(con("Topics:\n1 Medical 2 Business 3 Agriculture 4 All"));
    }
    if (inputs.length === 3) {
      const t = TOPIC_MAP[inputs[2]] || "all";
      payload.topics = t === "all" ? ["medical","business","agri"] : [t];
      saveSession(sessionId, "REG_REGION", payload);
      return res.send(con("Enter your region/county name (e.g., Nairobi)"));
    }
    if (inputs.length === 4) {
      payload.region = trim160(inputs[3]);
      saveSession(sessionId, "REG_BTYPE", payload);
      return res.send(con("Business type:\n1 Kiosk 2 Tailoring 3 Food 4 Beauty 5 Retail 6 Services"));
    }
    if (inputs.length === 5) {
      payload.business_type = pick(BIZ_TYPES, parseInt(inputs[4],10));
      saveSession(sessionId, "REG_TIME", payload);
      return res.send(con("Delivery time:\n1 Morning 2 Afternoon 3 Evening"));
    }
    if (inputs.length === 6) {
      payload.delivery_window = pick(TIMES, parseInt(inputs[5],10));
      saveSession(sessionId, "REG_CONSENT", payload);
      return res.send(con("Receive daily SMS lessons?\n1 Yes 2 No"));
    }
    if (inputs.length >= 7) {
      const yes = inputs[6] === "1";
      upsertUser({
        msisdn: phoneNumber,
        locale: payload.locale || "en",
        region: payload.region,
        business_type: payload.business_type,
        topics: payload.topics,
        delivery_window: payload.delivery_window || "evening",
        consent: yes
      });
      saveSession(sessionId, "HOME", {});
      return res.send(end("Registered. Expect daily SMS. Dial again to learn."));
    }
  }

  // 2 Learn Now (simple placeholder text for demo)
  if (choice === "2") {
    const u = getUser(phoneNumber) || { locale:"en", topics:["medical","business","agri"] };
    const tip = {
      medical: { en:"Boil drinking water to prevent diarrhea.", sw:"Chemsha maji ya kunywa kuzuia kuhara.", fr:"Faites bouillir l’eau à boire." },
      business:{ en:"Separate business & personal money; note daily sales.", sw:"Tenganisha pesa za biashara na binafsi; andika mauzo.", fr:"Séparez argent d’entreprise et personnel; notez ventes." },
      agri:    { en:"Rotate maize with legumes to improve soil.", sw:"Badilisha mahindi na kunde kuboresha udongo.", fr:"Alternez maïs et légumineuses." }
    };
    const topic = (u.topics || "medical,business,agri").split(",")[0] || "medical";
    const msg = tip[topic][u.locale||"en"] || tip[topic].en;
    return res.send(con(`${msg}\n1 Next  0 Home`));
  }

  // 3 Quiz & Progress (2 Qs)
  if (choice === "3") {
    if (inputs.length === 1) {
      saveSession(sessionId, "QUIZ_Q1");
      return res.send(con("Q1: Best way to prevent diarrhea?\n1 Clean water 2 Skip meals 3 Milk"));
    }
    if (inputs.length === 2) {
      payload.q1 = inputs[1] === "1" ? 1 : 0;
      saveSession(sessionId, "QUIZ_Q2", payload);
      return res.send(con("Q2: Why rotate crops?\n1 Colors 2 Reduce pests/soil 3 Nothing"));
    }
    if (inputs.length >= 3) {
      const score = (payload.q1 || 0) + (inputs[2] === "2" ? 1 : 0);
      run("INSERT INTO quiz_attempts(msisdn, topic, score) VALUES (?, ?, ?)", [phoneNumber, "mixed", score]);
      saveSession(sessionId, "HOME", {});
      return res.send(end(`You scored ${score}/2. Great job!`));
    }
  }

  // 4 Ask ReformHer (chatbot → short answer; SMS long)
  if (choice === "4") {
    if (inputs.length === 1) {
      saveSession(sessionId, "CHAT_WAIT");
      return res.send(con("Ask your question:"));
    }
    // Everything after first * is question content
    const q = inputs.slice(1).join(" ");
    try {
      const r = await fetch(`${process.env.AI_URL}/chat`, {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({ question: q, locale: "en" })
      });
      const data = await r.json();
      const shortAns = (data.short || "Sorry, try again.").slice(0,160);
      // (Optional) If data.full exists and is longer, you can send SMS via your SMS adapter here.
      saveSession(sessionId, "HOME", {});
      return res.send(con(`${shortAns}\n1 New Q  0 Home`));
    } catch (e) {
      saveSession(sessionId, "HOME", {});
      return res.send(end("AI not available. Please try later."));
    }
  }

  // 5 Certifications (stub)
  if (choice === "5") {
    return res.send(con("Certification L1 ready. 1 Start  0 Home"));
  }

  // 6 Business Help (by type)
  if (choice === "6") {
    if (inputs.length === 1) {
      return res.send(con("Pick type:\n1 Kiosk 2 Tailoring 3 Food 4 Beauty 5 Retail 6 Services"));
    }
    if (inputs.length >= 2) {
      const b = pick(["Kiosk","Tailoring","Food","Beauty","Retail","Services"], parseInt(inputs[1],10));
      return res.send(con(`${b}: Keep records, price = cost+profit, market daily.`));
    }
  }

  // 7 Agriculture (by Region)
  if (choice === "7") {
    if (inputs.length === 1) return res.send(con("Enter your region (e.g., Nairobi):"));
    const r = inputs[1];
    return res.send(con(`${r}: Mulch soil & rotate crops. Scout pests weekly.`));
  }

  // 8 Helpline
  if (choice === "8") {
    if (inputs.length === 1) return res.send(con("1 Call me back  2 Send hotline via SMS  0 Home"));
    if (inputs[1] === "1") {
      // Create helpline ticket (stub)
      return res.send(end("We will call you. For emergencies, visit nearest clinic."));
    }
    if (inputs[1] === "2") {
      return res.send(end("Hotline sent by SMS (stub). Stay safe."));
    }
  }

  // 9 Settings
  if (choice === "9") {
    return res.send(con("Settings: Change language/time later (stub). 0 Home"));
  }

  // default
  return res.send(con(`Choose an option:\n${MENU.HOME}`));
});

export default router;
