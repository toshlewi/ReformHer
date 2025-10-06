import express from "express";
import { all, get, run } from "../db.js";

const router = express.Router();

// Users (simple list)
router.get("/users", (req, res) => {
  const users = all("SELECT id, msisdn, locale, region, business_type, topics, delivery_window, consent FROM users ORDER BY id DESC");
  res.json({ users });
});

// Analytics summary
router.get("/analytics/summary", (req, res) => {
  const totalUsers = get("SELECT COUNT(*) as c FROM users").c || 0;
  const quizCount = get("SELECT COUNT(*) as c FROM quiz_attempts").c || 0;
  const avgScoreRow = get("SELECT AVG(score) as a FROM quiz_attempts");
  const avgScore = avgScoreRow && avgScoreRow.a ? Number(avgScoreRow.a).toFixed(2) : 0;
  const byTopic = all("SELECT topic, COUNT(*) as c FROM quiz_attempts GROUP BY topic");
  res.json({ totalUsers, quizCount, avgScore, byTopic });
});

// Helpline list/close (create happens in USSD flow)
router.get("/helpline", (req, res) => {
  try {
    const rows = all("SELECT id, msisdn, topic, notes, status, ts FROM helpline_tickets ORDER BY id DESC");
    res.json({ tickets: rows });
  } catch {
    // Table may not exist yet; return empty
    res.json({ tickets: [] });
  }
});

router.post("/helpline/close", (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "id required" });
  try {
    run("UPDATE helpline_tickets SET status='closed' WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "cannot close", detail: String(e) });
  }
});

export default router;
