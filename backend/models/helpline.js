import { run } from "../db.js";

export async function createHelplineTicket({ msisdn, topic = "General", notes = "" }) {
  run(
    "INSERT INTO helpline_tickets(msisdn, topic, notes, status) VALUES (?, ?, ?, 'pending')",
    [msisdn, topic, notes]
  );
  return true;
}
