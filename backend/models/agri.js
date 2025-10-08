// models/agri.js
import supabase from "../supabase.js";

export async function nextAgriTip({ msisdn, locale="en", region=null, crop=null }) {
  const { data: hist, error: hErr } = await supabase
    .from("agri_tips_history").select("tip_id").eq("msisdn", msisdn);
  if (hErr) throw hErr;
  const got = new Set((hist || []).map(x => x.tip_id));

  // Filter: locale + (region OR null) + (crop OR null)
  let q = supabase.from("agri_tips_catalog")
    .select("id, body, region, crop")
    .eq("is_active", true)
    .eq("locale", locale);

  // prefer matches; we’ll pick a best-fit below
  const { data: all, error } = await q;
  if (error) throw error;

  const candidates = (all || []).filter(t => !got.has(t.id));
  const byFit =
    candidates.find(t => (region && t.region === region) || (crop && t.crop === crop)) ||
    candidates[0] ||
    (all || [])[0];

  return byFit || null;
}

export async function logAgriTip(msisdn, tip_id) {
  const { error } = await supabase.from("agri_tips_history").insert([{ msisdn, tip_id }]);
  if (error) throw error;
}
