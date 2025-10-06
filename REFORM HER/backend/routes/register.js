import express from "express";
import { upsertUser } from "../models/user.js";
const router = express.Router();

router.post("/register", (req, res) => {
  const { msisdn, locale, region, business_type, topics, delivery_window, consent } = req.body || {};
  const user = upsertUser({ msisdn, locale, region, business_type, topics, delivery_window, consent });
  res.json({ ok: true, user });
});

export default router;
