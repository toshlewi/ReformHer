import express from "express";
import { get, run } from "../db.js";
import { upsertUser, getUser } from "../models/user.js";
import { con, end, parseText, trim160 } from "../utils/ussdHelpers.js";
import fetch from "node-fetch";
import { getNextLessonForUser, logLessonDelivery } from "../models/lesson.js";
import { getQuiz, recordQuizAttempt } from "../models/quiz.js";

// NEW: models for 4/6/7/8/9
import { getRule, getUserQuizStats, hasAward, awardCert } from "../models/cert.js";
import { nextAgriTip, logAgriTip } from "../models/agri.js";
import { queueSms } from "../models/sms.js";
import { createHelplineTicket } from "../models/helpline.js";
import { startAiSession, getRecentAiSession, addAiMessage } from "../models/ai.js";

const router = express.Router();

/* ---------------- Simple in-DB session helpers ---------------- */
function saveSession(sessionId, state, payload = {}) {
  const row = get("SELECT session_id FROM sessions WHERE session_id=?", [sessionId]);
  const payload_json = JSON.stringify(payload);
  if (row) {
    run(
      "UPDATE sessions SET state=?, payload_json=?, updated_at=CURRENT_TIMESTAMP WHERE session_id=?",
      [state, payload_json, sessionId]
    );
  } else {
    run(
      "INSERT INTO sessions(session_id, state, payload_json) VALUES (?, ?, ?)",
      [sessionId, state, payload_json]
    );
  }
}
function loadSession(sessionId) {
  const row = get("SELECT * FROM sessions WHERE session_id=?", [sessionId]);
  if (!row) return { state: "REG_LANG", payload: { locale: "en" } };
  return { state: row.state, payload: JSON.parse(row.payload_json || "{}") };
}

/* ---------------- Constants + i18n ---------------- */
const LANGS = ["en", "sw", "fr"];

const I18N = {
  en: {
    welcome: "Welcome to Reform Her",
    home: [
      "1. Register / Update profile",
      "2. Daily Lessons",
      "3. Quizzes",
      "4. Certifications",
      "5. Business Support",
      "6. Agriculture Tips",
      "7. Health Tips",
      "8. Helpline",
      "9. Talk to AI",
      "0. Exit",
    ].join("\n"),
    // Registration
    reg_found:
      "CON We found your profile.\n1. View profile\n2. Update region\n3. Update business type\n4. Update topics\n5. Update delivery window\n6. Delete my data\n0. Back",
    reg_region: "CON Region/County?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Other",
    reg_biz:
      "CON Choose business type:\n1. Trader\n2. Farmer\n3. Artisan\n4. Worker\n5. Entrepreneur\n9. Other",
    reg_window: "CON Choose preferred SMS time:\n1. Morning\n2. Afternoon\n3. Evening",
    reg_topics: "CON Enter topics (comma-separated, e.g. pricing, saving, health)",
    reg_confirm: "CON Save profile?\n1. Yes, save\n2. No, cancel",
    profile_saved: "END Profile saved. You'll receive a welcome SMS.",
    profile_updated: "END Profile updated.",
    profile_deleted: "END Your data has been deleted. Goodbye.",
    profile_view_prefix: "CON Your profile:",
    // Workers & Entrepreneurs submenus
    workers_menu: [
      "CON Workers’ Menu",
      "1. Know my rights",
      "2. Manage my money",
      "3. Get registered",
      "4. Improve my skills",
      "5. Join other women like me",
      "6. Report",
      "0. Home",
    ].join("\n"),
    entrepreneurs_menu: [
      "CON Entrepreneurs’ Menu",
      "1. Learn how to grow my business",
      "2. How to register your business",
      "3. Protect yourself & your family",
      "4. Inspiring women stories",
      "5. Talk to an advisor",
      "6. Report",
      "0. Home",
    ].join("\n"),
    // Generic
    choose_lang: "Choose language:\n1 English 2 Swahili 3 French",
    invalid_choice: "END Invalid choice.",
    back: "0. Back",
  },

  sw: {
    welcome: "Karibu Reform Her",
    home: [
      "1. Sajili / Sasisha wasifu",
      "2. Masomo ya kila siku",
      "3. Maswali (Quizzes)",
      "4. Vyeti",
      "5. Usaidizi wa Biashara",
      "6. Ushauri wa Kilimo",
      "7. Ushauri wa Afya",
      "8. Simu ya Msaada",
      "9. Zungumza na AI",
      "0. Toka",
    ].join("\n"),
    reg_found:
      "CON Tumeupata wasifu wako.\n1. Tazama wasifu\n2. Badilisha eneo\n3. Badilisha aina ya biashara\n4. Badilisha mada\n5. Badilisha muda wa SMS\n6. Futa data yangu\n0. Rudi",
    reg_region: "CON Eneo/Kaunti?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Nyingine",
    reg_biz:
      "CON Chagua aina ya biashara:\n1. Mfanyabiashara\n2. Mkulima\n3. Fundi/Artisan\n4. Mfanyakazi\n5. Mjasiriamali\n9. Nyingine",
    reg_window: "CON Chagua muda wa SMS:\n1. Asubuhi\n2. Mchana\n3. Jioni",
    reg_topics: "CON Andika mada (tenganisha kwa koma, mf. bei, akiba, afya)",
    reg_confirm: "CON Hifadhi wasifu?\n1. Ndiyo, hifadhi\n2. Hapana, batilisha",
    profile_saved: "END Wasifu umehifadhiwa. Ujumbe wa kukukaribisha utatumwa.",
    profile_updated: "END Wasifu umesasishwa.",
    profile_deleted: "END Taarifa zako zimefutwa. Kwaheri.",
    profile_view_prefix: "CON Wasifu wako:",
    choose_lang: "Chagua lugha:\n1 Kiingereza 2 Kiswahili 3 Kifaransa",
    invalid_choice: "END Chaguo batili.",
    back: "0. Rudi",
  },

  fr: {
    welcome: "Bienvenue à Reform Her",
    home: [
      "1. S’inscrire / Mettre à jour le profil",
      "2. Leçons quotidiennes",
      "3. Quiz",
      "4. Certificats",
      "5. Aide aux entreprises",
      "6. Conseils agricoles",
      "7. Conseils de santé",
      "8. Ligne d’assistance",
      "9. Parler à l’IA",
      "0. Quitter",
    ].join("\n"),
    reg_found:
      "CON Nous avons trouvé votre profil.\n1. Voir le profil\n2. Modifier la région\n3. Modifier le type d’activité\n4. Modifier les thèmes\n5. Modifier l’horaire SMS\n6. Supprimer mes données\n0. Retour",
    reg_region: "CON Région/Département ?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Autre",
    reg_biz:
      "CON Choisissez le type d’activité :\n1. Commerçante\n2. Agricultrice\n3. Artisane\n4. Travailleuse\n5. Entrepreneure\n9. Autre",
    reg_window: "CON Choisissez l’horaire SMS :\n1. Matin\n2. Après-midi\n3. Soir",
    reg_topics:
      "CON Saisissez les thèmes (séparés par des virgules, ex. prix, épargne, santé)",
    reg_confirm: "CON Enregistrer le profil ?\n1. Oui, enregistrer\n2. Non, annuler",
    profile_saved:
      "END Profil enregistré. Un SMS de bienvenue sera envoyé.",
    profile_updated: "END Profil mis à jour.",
    profile_deleted: "END Vos données ont été supprimées. Au revoir.",
    profile_view_prefix: "CON Votre profil :",
    choose_lang: "Choisissez la langue :\n1 Anglais 2 Swahili 3 Français",
    invalid_choice: "END Choix invalide.",
    back: "0. Retour",
  },
};

// Maps used when saving/updating
const REGION_MAP = { "1": "Nairobi", "2": "Kiambu", "3": "Mombasa", "9": "Other" };
const BIZ_MAP = {
  "1": "Trader",
  "2": "Farmer",
  "3": "Artisan",
  "4": "Worker",
  "5": "Entrepreneur",
  "9": "Other",
};
const WIN_MAP = { "1": "morning", "2": "afternoon", "3": "evening" };

/* ---------------- USSD Route (STATE-FIRST) ---------------- */
router.post("/ussd", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body || {};
  const inputs = parseText(text); // ["1","2",...]
  const { state, payload } = loadSession(sessionId);
  const locale = payload?.locale || "en";
  const L = I18N[locale] || I18N.en;

  /* ---------- First dial / language ---------- */
  if (inputs.length === 0 || !state) {
    saveSession(sessionId, "REG_LANG", { locale: "en" });
    return res.send(con(`${I18N.en.welcome}\n${I18N.en.choose_lang}`));
  }

  /* ---------- Language picker ---------- */
  if (state === "REG_LANG") {
    const idx = parseInt(inputs[0], 10);
    const picked = LANGS[idx - 1] || "en";
    saveSession(sessionId, "HOME", { locale: picked, localeChosen: true });
    return res.send(con(`${I18N[picked].welcome}\n${I18N[picked].home}`));
  }

  /* ---------- Home routes ---------- */
  if (state === "HOME") {
    const pick = inputs[0];
    switch (pick) {
      case "0": return res.send(end("Thank you for using Reform Her."));
      case "1": saveSession(sessionId, "REG_START", { locale }); return res.send(con(L.reg_region));
      case "2": saveSession(sessionId, "LESSON",   { locale });  return res.send(await handleLesson(msisdn(phoneNumber), locale));
      case "3": saveSession(sessionId, "QUIZ_Q1",  { locale });  return res.send(await handleQuizQ1(msisdn(phoneNumber), locale));
      case "4": saveSession(sessionId, "CERT_HOME",{ locale });  return res.send(await handleCertHome(msisdn(phoneNumber)));
      case "5": saveSession(sessionId, "BIZ_ENTRY",{ locale });  return res.send(con("Choose a path:\n1. Workers\n2. Entrepreneurs\n0. Home"));
      case "6": saveSession(sessionId, "AGRI_HOME",{ locale });  return res.send(await handleAgri(msisdn(phoneNumber), locale));
      case "7": saveSession(sessionId, "HEALTH_HOME", { locale, tipIdx: 0 }); return res.send(con(healthTips(locale)[0] + "\n1 Next tip  2 SMS me this  0 Home"));
      case "8": saveSession(sessionId, "HELP_HOME",{ locale });  return res.send(con("How can we help?\n1 Call me back\n2 SMS emergency hotlines\n3 Report abuse/harassment\n0 Home"));
      case "9": saveSession(sessionId, "AI_HOME",  { locale });  return res.send(con("Ask your question:"));
      default:  return res.send(con(`${L.welcome}\n${L.home}`));
    }
  }

  /* ---------- Registration flow ---------- */
  if (state === "REG_START") {
    const region = REGION_MAP[inputs[1]] || "Other";
    saveSession(sessionId, "REG_BIZ", { ...payload, region });
    return res.send(con(L.reg_biz));
  }
  if (state === "REG_BIZ") {
    const business_type = BIZ_MAP[inputs[1]] || "Other";
    saveSession(sessionId, "REG_WINDOW", { ...payload, business_type });
    return res.send(con(L.reg_window));
  }
  if (state === "REG_WINDOW") {
    const delivery_window = WIN_MAP[inputs[1]] || "evening";
    saveSession(sessionId, "REG_TOPICS", { ...payload, delivery_window });
    return res.send(con(L.reg_topics));
  }
  if (state === "REG_TOPICS") {
    const topics = trim160(inputs.slice(1).join(",").replace(/\*+/g, ",").trim());
    saveSession(sessionId, "REG_CONFIRM", { ...payload, topics });
    return res.send(con(L.reg_confirm));
  }
  if (state === "REG_CONFIRM") {
    const yes = inputs[1] === "1";
    if (!yes) { saveSession(sessionId, "HOME", { locale }); return res.send(con(`${L.welcome}\n${L.home}`)); }
    await upsertUser({
      msisdn: msisdn(phoneNumber),
      locale,
      region: payload.region,
      business_type: payload.business_type,
      topics: payload.topics,
      delivery_window: payload.delivery_window,
      consent: true,
    });
    saveSession(sessionId, "HOME", { locale });
    return res.send(end(L.profile_saved));
  }

  /* ---------- Lessons ---------- */
  if (state === "LESSON") {
    // Any follow-up input means "Next"
    return res.send(await handleLesson(msisdn(phoneNumber), locale));
  }

  /* ---------- Quiz ---------- */
  if (state === "QUIZ_Q1") {
    // inputs: ["3","<1-3>"]
    const ans1 = inputs[1];
    return res.send(await handleQuizQ2(sessionId, msisdn(phoneNumber), locale, ans1));
  }
  if (state === "QUIZ_Q2") {
    // inputs: ["3","<ans1>","<ans2>"]
    const ans2 = inputs[2];
    return res.send(await handleQuizScore(sessionId, msisdn(phoneNumber), ans2));
  }

  /* ---------- Certifications ---------- */
  if (state === "CERT_HOME") {
    if (inputs[1] === "1") {
      const msg = await handleCertClaim(msisdn(phoneNumber));
      saveSession(sessionId, "HOME", { locale });
      return res.send(end(msg));
    }
    saveSession(sessionId, "HOME", { locale });
    return res.send(con(`${L.welcome}\n${L.home}`));
  }

  /* ---------- Business: Workers / Entrepreneurs ---------- */
  if (state === "BIZ_ENTRY") {
    const pick = inputs[1];
    if (pick === "1") { saveSession(sessionId, "WORKER_MENU", { locale }); return res.send(con(L.workers_menu)); }
    if (pick === "2") { saveSession(sessionId, "ENT_MENU",    { locale }); return res.send(con(L.entrepreneurs_menu)); }
    saveSession(sessionId, "HOME", { locale });
    return res.send(con(`${L.welcome}\n${L.home}`));
  }
  if (state === "WORKER_MENU") {
    const sel = inputs[inputs.length - 1];
    switch (sel) {
      case "1": return res.send(con("Labor rights basics: contracts, minimum wage, safe workplace.\n0. Home"));
      case "2": return res.send(con("Money: track income/expenses, set goals, avoid predatory loans.\n0. Home"));
      case "3": return res.send(con("Get registered: national ID, social security, health insurance options.\n0. Home"));
      case "4": return res.send(con("Skills: pick one skill to improve this month; ask about training.\n0. Home"));
      case "5": return res.send(con("Join a workers’ group nearby; meet weekly; share info and savings.\n0. Home"));
      case "6": return res.send(con("Report: contact hotline or union rep; keep dates and details.\n0. Home"));
      case "0": saveSession(sessionId, "HOME", { locale }); return res.send(con(`${L.welcome}\n${L.home}`));
      default:  return res.send(con(L.workers_menu));
    }
  }
  if (state === "ENT_MENU") {
    const sel = inputs[inputs.length - 1];
    switch (sel) {
      case "1": return res.send(con("Growth: keep daily records, know your margin, test small marketing.\n0. Home"));
      case "2": return res.send(con("Register: name search, business license, tax PIN; ask local office.\n0. Home"));
      case "3": return res.send(con("Protect: separate money; emergency savings; basic insurance.\n0. Home"));
      case "4": return res.send(con("Stories: women growing via records and community support.\n0. Home"));
      case "5": return res.send(con("Advisor: we’ll connect you to a local mentor soon.\n0. Home"));
      case "6": return res.send(con("Report: share concerns about harassment or fraud to our helpline.\n0. Home"));
      case "0": saveSession(sessionId, "HOME", { locale }); return res.send(con(`${L.welcome}\n${L.home}`));
      default:  return res.send(con(L.entrepreneurs_menu));
    }
  }

  /* ---------- Agriculture Tips ---------- */
  if (state === "AGRI_HOME") {
    // Each input shows next tip again
    return res.send(await handleAgri(msisdn(phoneNumber), locale));
  }

  /* ---------- Health Tips (with SMS) ---------- */
  if (state === "HEALTH_HOME") {
    const tips = healthTips(locale);
    const tipIdx = payload.tipIdx ?? 0;

    // First entry handled at HOME; here we handle next/SMS/exit
    const cmd = inputs[1];
    if (cmd === "1") {
      const nextIdx = (tipIdx + 1) % tips.length;
      saveSession(sessionId, "HEALTH_HOME", { locale, tipIdx: nextIdx });
      return res.send(con(`${tips[nextIdx]}\n1 Next tip  2 SMS me this  0 Home`));
    }
    if (cmd === "2") {
      const sms = tips[tipIdx].slice(0, 160);
      await queueSms(msisdn(phoneNumber), sms);
      saveSession(sessionId, "HOME", { locale });
      return res.send(end("Tip sent by SMS."));
    }
    if (cmd === "0") {
      saveSession(sessionId, "HOME", { locale });
      return res.send(con(`${L.welcome}\n${L.home}`));
    }
    // invalid → re-show
    return res.send(con(`${tips[tipIdx]}\n1 Next tip  2 SMS me this  0 Home`));
  }

  /* ---------- Helpline ---------- */
  if (state === "HELP_HOME") {
    const sel = inputs[1];
    if (sel === "1") {
      await createHelplineTicket({ msisdn: msisdn(phoneNumber), topic: "Callback", notes: "USSD user requested a callback" });
      await queueSms(msisdn(phoneNumber), "We received your request. An agent will call you shortly.");
      saveSession(sessionId, "HOME", { locale });
      return res.send(end("Thank you. We will call you soon."));
    }
    if (sel === "2") {
      const body = [
        "Hotlines:",
        "Police: 999 / 112",
        "Ambulance: 911",
        "GBV Helpline: 116 / 0800-720-186",
      ].join("\n").slice(0, 160);
      await queueSms(msisdn(phoneNumber), body);
      saveSession(sessionId, "HOME", { locale });
      return res.send(end("Hotlines sent by SMS."));
    }
    if (sel === "3") {
      await createHelplineTicket({ msisdn: msisdn(phoneNumber), topic: "Abuse/Harassment", notes: "USSD report submitted" });
      await queueSms(msisdn(phoneNumber), "Your report has been logged. If in danger, call local emergency numbers now.");
      saveSession(sessionId, "HOME", { locale });
      return res.send(end("Report received. Stay safe — help is on the way."));
    }
    if (sel === "0") {
      saveSession(sessionId, "HOME", { locale });
      return res.send(con(`${L.welcome}\n${L.home}`));
    }
    return res.send(con("Invalid choice.\n0 Home"));
  }

  /* ---------- AI (persistent session) ---------- */
  if (state === "AI_HOME") {
    if (inputs.length === 1) return res.send(con("Ask your question:"));
    const question = inputs.slice(1).join(" ").trim();
    let session_id = payload.ai_session_id || getRecentAiSession(msisdn(phoneNumber));
    if (!session_id) session_id = startAiSession({ msisdn: msisdn(phoneNumber), locale, source: "ussd" });
    saveSession(sessionId, "AI_HOME", { ...payload, ai_session_id: session_id });

    addAiMessage({ session_id, role: "user", content: question });

    try {
      let shortAns = "Thanks for your question. We’ll get back to you shortly.";
      if (process.env.AI_URL) {
        const r = await fetch(`${process.env.AI_URL}/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question, locale }),
        });
        const data = await r.json();
        const full = (data.full || data.short || "").trim();
        shortAns = (data.short || full || shortAns).slice(0, 160);
        if (full) {
          addAiMessage({ session_id, role: "assistant", content: full });
          await queueSms(msisdn(phoneNumber), full.slice(0, 500));
        } else {
          addAiMessage({ session_id, role: "assistant", content: shortAns });
        }
      } else {
        const echo = `You asked: "${question}". We'll respond soon.`;
        addAiMessage({ session_id, role: "assistant", content: echo });
        await queueSms(msisdn(phoneNumber), echo.slice(0, 160));
        shortAns = echo.slice(0, 160);
      }
      // End the session (emulator will reset sessionId); you can also keep them in AI_HOME if you want follow-ups.
      saveSession(sessionId, "HOME", { locale });
      return res.send(end(shortAns));
    } catch {
      const fallback = "AI not available right now. Please try later.";
      addAiMessage({ session_id, role: "assistant", content: fallback });
      saveSession(sessionId, "HOME", { locale });
      return res.send(end(fallback));
    }
  }

  // Fallback → home
  saveSession(sessionId, "HOME", { locale });
  return res.send(con(`${L.welcome}\n${L.home}`));
});

/* ---------------- Helpers ---------------- */
const msisdn = (p) => p?.startsWith("+") ? p.slice(1) : p;

// Lessons
async function handleLesson(msisdn, locale) {
  const u = (await getUser(msisdn)) || { locale, topics: "business,medical,agri" };
  const lesson = await getNextLessonForUser({
    msisdn, locale: u.locale || "en", topics: u.topics || "business,medical,agri",
    region: u.region || null, business_type: u.business_type || null,
  });
  if (!lesson) return con("No new lesson available. Check back tomorrow.\n0. Home");
  await logLessonDelivery(msisdn, lesson.code);
  const body = (lesson.body || "").slice(0, 160);
  return con(`${body}\n1 Next  0 Home`);
}

// Quiz
async function handleQuizQ1(msisdn, locale) {
  const u = (await getUser(msisdn)) || { locale, topics: "business,medical,agri" };
  const topic = (u.topics || "business,medical,agri").split(",")[0] || "business";
  const quiz_code = "Q-BASIC-001";
  const qlist = await getQuiz({ locale: u.locale || "en", topic, quiz_code, limit: 2 });
  if (qlist.length < 2) return con("Quiz not ready. Please try later.\n0. Home");
  const q1 = qlist[0];
  return con(`Q1: ${q1.q}\n1 ${q1.a}\n2 ${q1.b}\n3 ${q1.c}`);
}
async function handleQuizQ2(sessionId, msisdn, locale, ans1) {
  const u = (await getUser(msisdn)) || { locale, topics: "business,medical,agri" };
  const topic = (u.topics || "business,medical,agri").split(",")[0] || "business";
  const quiz_code = "Q-BASIC-001";
  const qlist = await getQuiz({ locale: u.locale || "en", topic, quiz_code, limit: 2 });
  const q1 = qlist[0];
  const ok1 = q1.correct === (ans1 === "1" ? "A" : ans1 === "2" ? "B" : "C");
  // stash partial score
  saveSession(sessionId, "QUIZ_Q2", { locale, quiz_code, ok1 });
  const q2 = qlist[1];
  return con(`Q2: ${q2.q}\n1 ${q2.a}\n2 ${q2.b}\n3 ${q2.c}`);
}
async function handleQuizScore(sessionId, msisdn, ans2) {
  const st = loadSession(sessionId).payload || {};
  const quiz_code = st.quiz_code || "Q-BASIC-001";
  const u = await getUser(msisdn);
  const topic = (u?.topics || "business,medical,agri").split(",")[0] || "business";
  const qlist = await getQuiz({ locale: u?.locale || "en", topic, quiz_code, limit: 2 });
  const q2 = qlist[1];
  const ok2 = q2.correct === (ans2 === "1" ? "A" : ans2 === "2" ? "B" : "C");
  const score = (st.ok1 || 0) + (ok2 ? 1 : 0);
  await recordQuizAttempt({ msisdn, quiz_code, score, total: 2 });
  saveSession(sessionId, "HOME", { locale: u?.locale || "en" });
  return end(`You scored ${score}/2. Great job!`);
}

// Certifications
async function handleCertHome(msisdn) {
  const rule = await getRule("CERT-BASIC");
  if (!rule) return con("Cert path not configured.\n0 Home");
  const { count, avgPct } = await getUserQuizStats(msisdn);
  const already = await hasAward(msisdn, rule.code);
  const eligible = (count >= rule.min_quizzes) && (avgPct >= rule.min_score_pct) && !already;
  return [
    `CON ${rule.title}`,
    rule.description || "",
    `Quizzes done: ${count}`,
    `Average score: ${avgPct}%`,
    already ? "Status: ✅ Awarded" : eligible ? "Status: Eligible" : "Status: Keep going",
    eligible ? "1. Claim certificate\n0. Home" : "0. Home",
  ].join("\n");
}
async function handleCertClaim(msisdn) {
  const rule = await getRule("CERT-BASIC");
  if (!rule) return "Cert path not configured.";
  const { count, avgPct } = await getUserQuizStats(msisdn);
  const already = await hasAward(msisdn, rule.code);
  if (already) return "Already awarded. Congrats!";
  if (count < rule.min_quizzes || avgPct < rule.min_score_pct) return "Not eligible yet. Keep learning!";
  await awardCert(msisdn, rule.code);
  return "🎉 Certificate awarded! We’ll SMS details shortly.";
}

// Agriculture
async function handleAgri(msisdn, locale) {
  const u = (await getUser(msisdn)) || { locale };
  const tip = await nextAgriTip({
    msisdn, locale: u.locale || "en", region: u.region || null, crop: null,
  });
  if (!tip) return con("No new agriculture tips. Check later.\n0 Home");
  await logAgriTip(msisdn, tip.id);
  return con(`${tip.body}\n1 Next tip  0 Home`);
}

// Health tips per locale
function healthTips(locale) {
  const tips = {
    en: [
      "Drink safe water and wash hands with soap.",
      "Child diarrhea ORS: 6 tsp sugar + 1/2 tsp salt in 1L clean water.",
      "Sleep under treated bed nets to prevent malaria.",
    ],
    sw: [
      "Kunywa maji safi na osha mikono kwa sabuni.",
      "Mtoto akiwa na kuhara: ORS = sukari tsp 6 + chumvi 1/2 tsp kwenye lita 1 ya maji safi.",
      "Lala chini ya chandarua chenye dawa kuzuia malaria.",
    ],
    fr: [
      "Buvez de l’eau potable et lavez-vous les mains avec du savon.",
      "Diarrhée enfant: SRO = 6 c. à thé sucre + 1/2 c. à thé sel dans 1 L d’eau.",
      "Dormez sous une moustiquaire imprégnée pour prévenir le paludisme.",
    ],
  };
  return tips[locale] || tips.en;
}

export default router;
