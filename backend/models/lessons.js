// models/lesson.js
import supabase from '../supabase.js';

export async function getNextLessonForUser({ msisdn, locale='en', topics='business,medical,agri', region=null, business_type=null }) {
  const topic = (Array.isArray(topics) ? topics.join(',') : topics).split(',')[0] || 'business';

  // exclude lessons already sent to this user
  const { data: sent, error: sentErr } = await supabase
    .from('lesson_history')
    .select('lesson_code')
    .eq('msisdn', msisdn);
  if (sentErr) throw sentErr;
  const sentCodes = new Set((sent || []).map(r => r.lesson_code));

  // fetch candidates
  const { data: candidates, error: candErr } = await supabase
    .from('lesson_catalog')
    .select('code, body, locale, topic, business_type, region')
    .eq('is_active', true)
    .eq('locale', locale)
    .eq('topic', topic);
  if (candErr) throw candErr;

  // pick first unsent matching business/region (fallbacks allowed)
  const pick = (candidates || []).find(c =>
    !sentCodes.has(c.code) &&
    (!c.business_type || c.business_type === business_type) &&
    (!c.region || c.region === region)
  ) || (candidates || []).find(c => !sentCodes.has(c.code)); // fallback any unsent

  return pick || null;
}

export async function logLessonDelivery(msisdn, lesson_code) {
  const { error } = await supabase
    .from('lesson_history')
    .insert([{ msisdn, lesson_code }]);
  if (error) throw error;
}
