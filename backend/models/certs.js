// models/cert.js
import supabase from "../supabase.js";

export async function getRule(code = "CERT-BASIC") {
  const { data, error } = await supabase.from("cert_rules").select("*").eq("code", code).single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function getUserQuizStats(msisdn) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score,total")
    .eq("msisdn", msisdn);
  if (error) throw error;
  const attempts = data || [];
  const count = attempts.length;
  const avgPct =
    count === 0 ? 0 :
    Math.round(
      (attempts.reduce((s, r) => s + (r.score / Math.max(1, r.total)), 0) / count) * 100
    );
  return { count, avgPct };
}

export async function hasAward(msisdn, cert_code = "CERT-BASIC") {
  const { data, error } = await supabase
    .from("cert_awards")
    .select("id")
    .eq("msisdn", msisdn)
    .eq("cert_code", cert_code)
    .maybeSingle?.(); // older clients: ignore; will simply return data[0]
  if (error && error.code !== "PGRST116") throw error;
  return !!(Array.isArray(data) ? data[0] : data);
}

export async function awardCert(msisdn, cert_code = "CERT-BASIC") {
  const { error } = await supabase.from("cert_awards").insert([{ msisdn, cert_code }]);
  if (error) throw error;
}
