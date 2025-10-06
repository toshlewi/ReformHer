import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/healthz", (_, res) => res.json({ ok: true }));

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { msisdn, language, topic, region, business_type, delivery_time, consent } = req.body;
  try {
    await pool.execute(
      "INSERT INTO users (msisdn, language, topic, region, business_type, delivery_time, consent) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [msisdn, language, topic, region, business_type, delivery_time, consent]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// USSD endpoint (basic example)
app.post("/api/ussd", async (req, res) => {
  const { msisdn, text } = req.body;
  let response = "Welcome to Reform Her!\n1. Register\n2. Learn\n3. Quiz\n4. Chatbot\n0. Exit";
  res.json({ message: response });
});

// AI proxy endpoint
app.post("/api/ai", async (req, res) => {
  const { question } = req.body;
  try {
    const aiUrl = process.env.AI_URL || "http://localhost:5000";
    const response = await axios.post(`${aiUrl}/ai`, { question });
    res.json({ answer: response.data.answer });
  } catch (err) {
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// Analytics endpoint for dashboard
app.get("/api/analytics/summary", async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const quizCount = 42;
    const avgScore = 78;
    const [byTopic] = await pool.query("SELECT topic, COUNT(*) AS c FROM users GROUP BY topic");
    res.json({ totalUsers, quizCount, avgScore, byTopic });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed", details: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node.js backend running on port ${PORT}`));
