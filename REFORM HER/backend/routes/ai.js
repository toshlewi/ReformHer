import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const r = await fetch(`${process.env.AI_URL}/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "AI unreachable", detail: String(e) });
  }
});

export default router;
