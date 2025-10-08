// models/quiz.js
import supabase from '../supabase.js';

export async function getQuiz({ locale='en', topic='business', quiz_code='Q-BASIC-001', limit=3 }) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, quiz_code, q, a, b, c, correct')
    .eq('quiz_code', quiz_code)
    .eq('locale', locale)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function recordQuizAttempt({ msisdn, quiz_code, score, total }) {
  const { error } = await supabase
    .from('quiz_attempts')
    .insert([{ msisdn, quiz_code, score, total }]);
  if (error) throw error;
}
