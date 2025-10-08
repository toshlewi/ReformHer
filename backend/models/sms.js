// queue an SMS for the dashboard (sms_outbox)
import { run } from "../db.js";

export async function queueSms(msisdn, body) {
  run("INSERT INTO sms_outbox(msisdn, body, status) VALUES (?, ?, 'QUEUED')", [
    msisdn,
    body,
  ]);
  return true;
}
