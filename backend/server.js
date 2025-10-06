// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from './supabase.js';

const app = express();
const log = (...args) =>
  process.env.NODE_ENV !== 'production' && console.log('[USSD]', ...args);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false })); // x-www-form-urlencoded (USSD)
app.use(express.json());                            // JSON
app.use(express.text({ type: 'text/*' }));          // text/plain gateways

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Root
app.get('/', (_req, res) => res.json({ name: 'Reform Her API', up: true }));

/** Helper: queue an SMS in outbox (dashboard reads this) */
async function queueSms(msisdn, body) {
  const { error } = await supabase.from('sms_outbox').insert([{ msisdn, body }]);
  if (error) throw error;
}

/** USSD endpoint
 * Accepts various provider payload shapes (serviceCode/sessionId/phoneNumber/text)
 * Returns plain text starting with "CON" (continue) or "END" (finish)
 */
app.post('/api/ussd', async (req, res) => {
  try {
    // ✅ Robust extraction & fallbacks for different gateways
    let { sessionId, serviceCode, phoneNumber, text } =
      typeof req.body === 'object' ? (req.body || {}) : {};

    sessionId =
      sessionId ||
      req.body?.session_id ||
      req.query?.sessionId ||
      `sess_${Date.now()}`;

    serviceCode =
      serviceCode ||
      req.body?.service_code ||
      req.query?.serviceCode ||
      '*500#';

    phoneNumber = (
      phoneNumber ||
      req.body?.msisdn ||
      req.query?.phoneNumber ||
      ''
    )
      .toString()
      .trim();

    // Some gateways post raw text/plain into req.body; also accept "message"
    const rawText =
      text ??
      req.body?.message ??
      req.query?.text ??
      (typeof req.body === 'string' ? req.body : '');
    text = (rawText || '').toString().trim();

    log('REQ:', req.headers['content-type'], { sessionId, serviceCode, phoneNumber, text });

    // ✅ Accept *500# and variants (gateways sometimes append chars)
    if (!serviceCode || !serviceCode.startsWith('*500#')) {
      return res.status(200).send('END Invalid short code. Please dial *500#');
    }

    const parts = text.split('*').filter(Boolean);
    const level = parts.length;

    // Main menu
    if (level === 0) {
      return res.send(
        'CON Reform Her\n' +
          '1. Register / Update profile\n' +
          '2. Daily Lessons\n' +
          '3. Quizzes\n' +
          '4. Certifications\n' +
          '5. Business Support\n' +
          '6. Agriculture Tips\n' +
          '7. Health Tips\n' +
          '8. Helpline\n' +
          '0. Exit'
      );
    }

    const choice1 = parts[0];

    if (choice1 === '0') {
      return res.send('END Thank you for using Reform Her.');
    }

    // 1) Register flow
    if (choice1 === '1') {
      if (level === 1) {
        return res.send('CON Choose language:\n1. English\n2. Kiswahili\n3. French');
      }
      if (level === 2) {
        return res.send('CON Region/County?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Other');
      }
      if (level === 3) {
        const locale = parts[1] === '2' ? 'sw' : parts[1] === '3' ? 'fr' : 'en';
        const regionMap = { '1': 'Nairobi', '2': 'Kiambu', '3': 'Mombasa', '9': 'Other' };
        const region = regionMap[parts[2]] || 'Other';

        const { error } = await supabase
          .from('users')
          .upsert([{ msisdn: phoneNumber, locale, region, consent: true }], {
            onConflict: 'msisdn',
          });
        if (error) throw error;

        await queueSms(phoneNumber, 'Welcome to Reform Her! Your profile is set.');
        return res.send("END Profile saved. You'll receive a welcome SMS.");
      }
    }

    // 2) Daily Lessons
    if (choice1 === '2') {
      await queueSms(phoneNumber, "Today's lesson: Basic pricing strategies for small shops.");
      return res.send('END Lesson sent by SMS. Reply QUIZ for a quick test.');
    }

    // 3) Quizzes
    if (choice1 === '3') {
      await queueSms(
        phoneNumber,
        'Quiz: If you buy at 80 and sell at 100, your profit is? A)10 B)15 C)20'
      );
      return res.send('END Quiz sent by SMS. Reply A, B, or C.');
    }

    // 4) Certifications
    if (choice1 === '4') {
      await queueSms(
        phoneNumber,
        'Certification path: Complete 5 quizzes with 80%+ to earn a badge.'
      );
      return res.send('END Certification info sent by SMS.');
    }

    // 5) Business Support
    if (choice1 === '5' && level === 1) {
      return res.send('CON Choose a topic:\n1. Record-keeping\n2. Marketing\n3. Micro-finance');
    }
    if (choice1 === '5' && level === 2) {
      const topic = parts[1];
      const map = {
        '1': 'Record-keeping tip: Use a simple cashbook daily.',
        '2': 'Marketing tip: Promote in church groups & market day.',
        '3': 'Micro-finance tip: Compare interest & hidden fees.',
      };
      await queueSms(phoneNumber, map[topic] || 'Business tip coming soon.');
      return res.send('END Business tip sent by SMS.');
    }

    // 6) Agriculture Tips
    if (choice1 === '6') {
      await queueSms(phoneNumber, 'Agri tip (maize): Use mulching to retain soil moisture.');
      return res.send('END Agriculture tip sent by SMS.');
    }

    // 7) Health Tips
    if (choice1 === '7') {
      await queueSms(
        phoneNumber,
        'Health tip: ORS for diarrhea = 6 level tsp sugar + 1/2 tsp salt in 1 liter clean water.'
      );
      return res.send('END Health tip sent by SMS.');
    }

    // 8) Helpline
    if (choice1 === '8') {
      await queueSms(phoneNumber, 'Helpline request received. We will call you back shortly.');
      const { error } = await supabase
        .from('helpline_tickets')
        .insert([{ msisdn: phoneNumber, topic: 'General', notes: 'USSD helpline callback request' }]);
      if (error) throw error;
      return res.send('END Thank you. A helpline agent will contact you.');
    }

    return res.send('END Invalid choice.');
  } catch (err) {
    console.error('USSD error:', err);
    return res.status(200).send('END Service temporarily unavailable. Please try again.');
  }
});

/** Dashboard APIs **/

// Outbox
app.get('/api/sms/outbox', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const { data, error } = await supabase
      .from('sms_outbox')
      .select('id, msisdn, body, status, created_at')
      .order('id', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ messages: data || [] });
  } catch (e) {
    console.error('Outbox error:', e);
    res.json({ messages: [] });
  }
});

// Users
app.get('/api/users', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json({ users: data || [] });
  } catch (e) {
    console.error('Users error:', e);
    res.json({ users: [] });
  }
});

// Analytics summary
app.get('/api/analytics/summary', async (_req, res) => {
  try {
    const { count: userCount, error: uErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (uErr) throw uErr;

    const { count: quizCount, error: qErr } = await supabase
      .from('sms_outbox')
      .select('*', { count: 'exact', head: true })
      .ilike('body', 'Quiz:%');
    if (qErr) throw qErr;

    res.json({
      totalUsers: userCount || 0,
      quizCount: quizCount || 0,
      avgScore: 4.2, // wire to quiz_attempts if you record answers
      byTopic: [
        { topic: 'Health', c: 12 },
        { topic: 'Business', c: 18 },
        { topic: 'Agriculture', c: 9 },
      ],
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.json({ totalUsers: 0, quizCount: 0, avgScore: 0, byTopic: [] });
  }
});

// Start server with robust error logging
const PORT = Number(process.env.PORT || 8000);
const server = app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// global error visibility
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
