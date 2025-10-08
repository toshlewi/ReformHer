// models/business.js
import supabase from "../supabase.js";

export async function nextBusinessTip({ msisdn, locale="en", business_type=null }) {
  // What user already got
  const { data: hist, error: hErr } = await supabase
    .from("business_support_history").select("tip_id").eq("msisdn", msisdn);
  if (hErr) throw hErr;
  const got = new Set((hist || []).map(x => x.tip_id));

  // Candidates filtered by locale & (optional) business_type
  let q = supabase.from("business_support_catalog")
    .select("id, body, business_type, level")
    .eq("is_active", true)
    .eq("locale", locale);
  if (business_type) q = q.or(`business_type.is.null,business_type.eq.${business_type}`);

  const { data: tips, error } = await q;
  if (error) throw error;

  const pick = (tips || []).find(t => !got.has(t.id)) || (tips || [])[0];
  return pick || null;
}

export async function logBusinessTip(msisdn, tip_id) {
  const { error } = await supabase.from("business_support_history").insert([{ msisdn, tip_id }]);
  if (error) throw error;
}
