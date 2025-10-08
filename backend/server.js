// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from './supabase.js';

const app = express();
const log = (...args) =>
  process.env.NODE_ENV !== 'production' && console.log('[USSD]', ...args);

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false })); // x-www-form-urlencoded (USSD)
app.use(express.json());                            // JSON
app.use(express.text({ type: 'text/*' }));          // text/plain gateways

// ---------------------------------------------------------
// Health + Root
// ---------------------------------------------------------
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ name: 'Reform Her API', up: true }));

// ---------------------------------------------------------
// Helper: queue an SMS in outbox (dashboard polls this)
// ---------------------------------------------------------
async function queueSms(msisdn, body) {
  const { error } = await supabase.from('sms_outbox').insert([{ msisdn, body }]);
  if (error) throw error;
}

// ---------------------------------------------------------
// i18n packs (USSD copy + SMS templates)
// ---------------------------------------------------------
const I18N = {
  en: {
    app: 'Reform Her',
    choose_lang_title: 'Welcome to Reform Her\nSelect Language:',
    choose_lang_opts: '1. English\n2. Swahili\n3. French\n4. Portuguese',
    main: [
      'CON Reform Her',
      '1. Register / Update profile',
      '2. Daily Lessons',
      '3. Quizzes',
      '4. Certifications',
      '5. Business Support',
      '6. Agriculture Tips',
      '7. Health Tips',
      '8. Helpline',
      '9. Talk to AI',
      '0. Exit',
    ].join('\n'),
    thanks: 'END Thank you for using Reform Her.',
    // Registration & Update flows
    reg_found:
      'CON We found your profile.\n1. View profile\n2. Update region\n3. Update business type\n4. Update topics\n5. Update delivery window\n6. Delete my data\n0. Back',
    reg_region: 'CON Region/County?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Other',
    reg_biz: 'CON Choose business type:\n1. Enterpreneur\n2. Farmer\n3. Worker\n9. Other',
    reg_window: 'CON Choose preferred SMS time:\n1. Morning\n2. Afternoon\n3. Evening',
    reg_topics: 'CON Enter topics (comma-separated, e.g. pricing, saving, health)',
    reg_confirm: 'CON Save profile?\n1. Yes, save\n2. No, cancel',
    profile_saved: "END Profile saved. You'll receive a welcome SMS.",
    profile_updated: 'END Profile updated.',
    profile_deleted: 'END Your data has been deleted. Goodbye.',
    profile_view_prefix: 'CON Your profile:',
    // General
    lessons_end: 'END Lesson sent by SMS. Reply QUIZ for a quick test.',
    quiz_end: 'END Quiz sent by SMS. Reply A, B, or C.',
    cert_end: 'END Certification info sent by SMS.',
    biz_pick: 'CON Choose a topic:\n1. Record-keeping\n2. Marketing\n3. Micro-finance',
    invalid_choice: 'END Invalid choice.',
    invalid_sc: 'END Invalid short code. Please dial *500#',
    down: 'END Service temporarily unavailable. Please try again.',
    sms: {
      welcome: 'Welcome to Reform Her! Your profile is set.',
      lesson: "Today's lesson: Basic pricing strategies for small shops.",
      quiz: 'Quiz: If you buy at 80 and sell at 100, your profit is? A)10 B)15 C)20',
      cert: 'Certification path: Complete 5 quizzes with 80%+ to earn a badge.',
      biz: {
        '1': 'Record-keeping tip: Use a simple cashbook daily.',
        '2': 'Marketing tip: Promote in church groups & market day.',
        '3': 'Micro-finance tip: Compare interest & hidden fees.',
      },
      agri: 'Agri tip (maize): Use mulching to retain soil moisture.',
      health: 'Health tip: ORS = 6 tsp sugar + 1/2 tsp salt in 1L clean water.',
      helpline: 'Helpline request received. We will call you back shortly.',
    },
  },

  sw: {
    app: 'Reform Her',
    choose_lang_title: 'Karibu Reform Her\nChagua Lugha:',
    choose_lang_opts: '1. Kiingereza\n2. Kiswahili\n3. Kifaransa\n4. Kireno',
    main: [
      'CON Reform Her',
      '1. Sajili / Sasisha wasifu',
      '2. Masomo ya kila siku',
      '3. Maswali (Quizzes)',
      '4. Vyeti',
      '5. Usaidizi wa Biashara',
      '6. Ushauri wa Kilimo',
      '7. Ushauri wa Afya',
      '8. Simu ya Msaada',
      '9. Zungumza na AI',
      '0. Toka',
    ].join('\n'),
    thanks: 'END Asante kwa kutumia Reform Her.',
    reg_found:
      'CON Tumeupata wasifu wako.\n1. Tazama wasifu\n2. Badilisha eneo\n3. Badilisha aina ya biashara\n4. Badilisha mada\n5. Badilisha muda wa SMS\n6. Futa data yangu\n0. Rudi',
    reg_region: 'CON Eneo/Kaunti?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Nyingine',
    reg_biz: 'CON Chagua aina ya biashara:\n1. Mfanyabiashara\n2. Mkulima\n3. Fundi/Artisan\n9. Nyingine',
    reg_window: 'CON Chagua muda wa SMS:\n1. Asubuhi\n2. Mchana\n3. Jioni',
    reg_topics: 'CON Andika mada (tenganisha kwa koma, mf. bei, akiba, afya)',
    reg_confirm: 'CON Hifadhi wasifu?\n1. Ndiyo, hifadhi\n2. Hapana, batilisha',
    profile_saved: 'END Wasifu umehifadhiwa. Ujumbe wa kukukaribisha utatumwa.',
    profile_updated: 'END Wasifu umesasishwa.',
    profile_deleted: 'END Taarifa zako zimefutwa. Kwaheri.',
    profile_view_prefix: 'CON Wasifu wako:',
    lessons_end: 'END Somo limetumwa kwa SMS. Jibu QUIZ kwa jaribio fupi.',
    quiz_end: 'END Maswali yametumwa kwa SMS. Jibu A, B, au C.',
    cert_end: 'END Taarifa za vyeti zimetumwa kwa SMS.',
    biz_pick: 'CON Chagua mada:\n1. Kuweka kumbukumbu\n2. Masoko\n3. Mikopo midogo',
    invalid_choice: 'END Chaguo batili.',
    invalid_sc: 'END Nambari si sahihi. Piga *500#',
    down: 'END Huduma haipatikani kwa sasa. Jaribu tena.',
    sms: {
      welcome: 'Karibu Reform Her! Wasifu wako umehifadhiwa.',
      lesson: 'Somo la leo: Mbinu rahisi za upangaji bei kwa biashara ndogo.',
      quiz: 'Maswali: Ukinunua kwa 80 na kuuza kwa 100, faida ni? A)10 B)15 C)20',
      cert: 'Njia ya cheti: Kamilisha maswali 5 na alama 80%+ ili upate beji.',
      biz: {
        '1': 'Ushauri: Andika mapato na matumizi yako kila siku.',
        '2': 'Ushauri: Tangaza kwenye vikundi vya kanisa na siku ya soko.',
        '3': 'Ushauri: Linganisha riba na ada zilizofichwa kabla ya kukopa.',
      },
      agri: 'Ushauri wa kilimo (mahindi): Tumia matandazo kuhifadhi unyevu.',
      health: 'Ushauri wa afya: ORS = sukari tsp 6 + chumvi 1/2 tsp kwenye lita 1 ya maji safi.',
      helpline: 'Ombi la msaada limepokelewa. Tutakupigia hivi karibuni.',
    },
  },

  fr: {
    app: 'Reform Her',
    choose_lang_title: 'Bienvenue à Reform Her\nChoisissez la langue :',
    choose_lang_opts: '1. Anglais\n2. Swahili\n3. Français\n4. Portugais',
    main: [
      'CON Reform Her',
      '1. S’inscrire / Mettre à jour le profil',
      '2. Leçons quotidiennes',
      '3. Quiz',
      '4. Certificats',
      '5. Aide aux entreprises',
      '6. Conseils agricoles',
      '7. Conseils de santé',
      '8. Ligne d’assistance',
      '9. Parler à l’IA',
      '0. Quitter',
    ].join('\n'),
    thanks: 'END Merci d’utiliser Reform Her.',
    reg_found:
      'CON Nous avons trouvé votre profil.\n1. Voir le profil\n2. Modifier la région\n3. Modifier le type d’activité\n4. Modifier les thèmes\n5. Modifier l’horaire SMS\n6. Supprimer mes données\n0. Retour',
    reg_region: 'CON Région/Département ?\n1. Nairobi\n2. Kiambu\n3. Mombasa\n9. Autre',
    reg_biz: 'CON Choisissez le type d’activité :\n1. Commerçante\n2. Agricultrice\n3. Artisane\n9. Autre',
    reg_window: 'CON Choisissez l’horaire SMS :\n1. Matin\n2. Après-midi\n3. Soir',
    reg_topics: 'CON Saisissez les thèmes (séparés par des virgules, ex. prix, épargne, santé)',
    reg_confirm: 'CON Enregistrer le profil ?\n1. Oui, enregistrer\n2. Non, annuler',
    profile_saved: 'END Profil enregistré. Un SMS de bienvenue sera envoyé.',
    profile_updated: 'END Profil mis à jour.',
    profile_deleted: 'END Vos données ont été supprimées. Au revoir.',
    profile_view_prefix: 'CON Votre profil :',
    lessons_end: 'END Leçon envoyée par SMS. Répondez QUIZ pour un test rapide.',
    quiz_end: 'END Quiz envoyé par SMS. Répondez A, B ou C.',
    cert_end: 'END Informations sur les certificats envoyées par SMS.',
    biz_pick: 'CON Choisissez un sujet :\n1. Comptabilité\n2. Marketing\n3. Micro-finance',
    invalid_choice: 'END Choix invalide.',
    invalid_sc: 'END Code court invalide. Veuillez composer *500#',
    down: 'END Service temporairement indisponible. Veuillez réessayer.',
    sms: {
      welcome: 'Bienvenue sur Reform Her ! Votre profil est enregistré.',
      lesson: 'Leçon du jour : Stratégies simples de tarification pour petites boutiques.',
      quiz: 'Quiz : Si vous achetez à 80 et vendez à 100, votre profit est ? A)10 B)15 C)20',
      cert: 'Certification : Réussissez 5 quiz avec 80 %+ pour obtenir un badge.',
      biz: {
        '1': 'Astuce : Tenez un cahier de caisse simple chaque jour.',
        '2': 'Astuce : Faites votre promo à l’église et le jour de marché.',
        '3': "Astuce : Comparez les taux d’intérêt et les frais cachés.",
      },
      agri: 'Conseil agricole (maïs) : Utilisez le paillage pour garder l’humidité du sol.',
      health: 'Conseil santé : SRO = 6 c. à thé sucre + 1/2 c. à thé sel dans 1 L d’eau.',
      helpline: "Demande d’assistance reçue. Nous vous rappellerons sous peu.",
    },
  },

  pt: {
    app: 'Reform Her',
    choose_lang_title: 'Bem-vinda à Reform Her\nSelecione o idioma:',
    choose_lang_opts: '1. Inglês\n2. Suaíli\n3. Francês\n4. Português',
    main: [
      'CON Reform Her',
      '1. Cadastrar / Atualizar perfil',
      '2. Aulas diárias',
      '3. Questionários',
      '4. Certificações',
      '5. Suporte a negócios',
      '6. Dicas de agricultura',
      '7. Dicas de saúde',
      '8. Linha de apoio',
      '9. Falar com a IA',
      '0. Sair',
    ].join('\n'),
    thanks: 'END Obrigada por usar o Reform Her.',
    reg_found:
      'CON Encontrámos o seu perfil.\n1. Ver perfil\n2. Atualizar região\n3. Atualizar tipo de negócio\n4. Atualizar tópicos\n5. Atualizar horário de SMS\n6. Eliminar os meus dados\n0. Voltar',
    reg_region: 'CON Região/Condado?\n1. Nairóbi\n2. Kiambu\n3. Mombaça\n9. Outro',
    reg_biz: 'CON Escolha o tipo de negócio:\n1. Vendedora\n2. Agricultora\n3. Artesã\n9. Outro',
    reg_window: 'CON Escolha o horário de SMS:\n1. Manhã\n2. Tarde\n3. Noite',
    reg_topics: 'CON Introduza tópicos (separados por vírgulas, ex. preços, poupança, saúde)',
    reg_confirm: 'CON Guardar perfil?\n1. Sim, guardar\n2. Não, cancelar',
    profile_saved: 'END Perfil salvo. Você receberá um SMS de boas-vindas.',
    profile_updated: 'END Perfil atualizado.',
    profile_deleted: 'END Os seus dados foram eliminados. Adeus.',
    profile_view_prefix: 'CON O seu perfil:',
    lessons_end: 'END Lição enviada por SMS. Responda QUIZ para um teste rápido.',
    quiz_end: 'END Questionário enviado por SMS. Responda A, B ou C.',
    cert_end: 'END Informações de certificação enviadas por SMS.',
    biz_pick: 'CON Escolha um tópico:\n1. Registo de caixa\n2. Marketing\n3. Microfinanças',
    invalid_choice: 'END Opção inválida.',
    invalid_sc: 'END Código inválido. Disque *500#',
    down: 'END Serviço temporariamente indisponível. Tente novamente.',
    sms: {
      welcome: 'Bem-vinda ao Reform Her! Seu perfil foi definido.',
      lesson: 'Lição de hoje: Estratégias simples de preços para pequenos comércios.',
      quiz: 'Quiz: Se você compra por 80 e vende por 100, o lucro é? A)10 B)15 C)20',
      cert: 'Certificação: Complete 5 quizzes com 80%+ para ganhar um selo.',
      biz: {
        '1': 'Dica: Registre entradas e saídas em um livro-caixa simples.',
        '2': 'Dica: Divulgue em grupos da igreja e no dia de feira.',
        '3': 'Dica: Compare juros e taxas ocultas antes de pegar empréstimo.',
      },
      agri: 'Dica (milho): Use cobertura morta para reter a umidade do solo.',
      health: 'Dica de saúde: SRO = 6 colheres chá açúcar + 1/2 de sal em 1 L água.',
      helpline: 'Pedido de ajuda recebido. Em breve entraremos em contato.',
    },
  },
};
const LANG_BY_DIGIT = { '1': 'en', '2': 'sw', '3': 'fr', '4': 'pt' };

// ---------------------------------------------------------
// USSD endpoint
// ---------------------------------------------------------
app.post('/api/ussd', async (req, res) => {
  try {
    // Robust extraction for different gateways
    let { sessionId, serviceCode, phoneNumber, text } =
      typeof req.body === 'object' ? (req.body || {}) : {};

    sessionId =
      sessionId || req.body?.session_id || req.query?.sessionId || `sess_${Date.now()}`;

    serviceCode =
      serviceCode || req.body?.service_code || req.query?.serviceCode || '*500#';

    phoneNumber = (
      phoneNumber || req.body?.msisdn || req.query?.phoneNumber || ''
    ).toString().trim();

    const rawText =
      text ?? req.body?.message ?? req.query?.text ?? (typeof req.body === 'string' ? req.body : '');
    const textStr = (rawText || '').toString().trim();

    log('REQ:', req.headers['content-type'], { sessionId, serviceCode, phoneNumber, text: textStr });

    // Accept *500# and variants (some gateways append suffixes)
    if (!serviceCode || !serviceCode.startsWith('*500#')) {
      return res.status(200).send(I18N.en.invalid_sc);
    }

    const parts = textStr.split('*').filter(Boolean);
    const level = parts.length;

    // Level 0: ALWAYS show language screen first
    if (level === 0) {
      const L0 = I18N.en; // default copy language for the very first screen
      return res.send(`CON ${L0.choose_lang_title}\n${L0.choose_lang_opts}`);
    }

    // From here on, use the chosen language
    const locale = LANG_BY_DIGIT[parts[0]] || 'en';
    const L = I18N[locale] || I18N.en;

    // Level 1: After selecting language, show main menu
    if (level === 1) {
      return res.send(L.main);
    }

    // After language, the main menu selection is at parts[1]
    const choice1 = parts[1];

    // ---------------- Exit
    if (choice1 === '0') {
      return res.send(L.thanks);
    }

    // ---------------- Register / Update profile ----------------
    if (choice1 === '1') {
      const regionMap = { '1': 'Nairobi', '2': 'Kiambu', '3': 'Mombasa', '9': 'Other' };
      const bizMap = { '1': 'Trader', '2': 'Farmer', '3': 'Artisan', '9': 'Other' };
      const winMap = { '1': 'morning', '2': 'afternoon', '3': 'evening' };

      // Is user already registered?
      const { data: existing, error: gErr } = await supabase
        .from('users')
        .select('*')
        .eq('msisdn', phoneNumber)
        .maybeSingle();
      if (gErr) throw gErr;

      // Existing user: show update menu at level === 2
      if (existing) {
        if (level === 2) {
          return res.send(L.reg_found);
        }

        const sub = parts[2];           // which update action
        const subValue = parts[3];      // the value/selection for that action
        const freeText = parts.slice(3).join(',').replace(/\*+/g, ',').trim();

        // 1) View profile
        if (sub === '1') {
          const lines = [
            L.profile_view_prefix,
            `MSISDN: ${existing.msisdn || '-'}`,
            `Region: ${existing.region || '-'}`,
            `Business: ${existing.business_type || '-'}`,
            `Topics: ${existing.topics || '-'}`,
            `Window: ${existing.delivery_window || '-'}`,
            '',
            '0. Back',
          ].join('\n');
          return res.send(lines);
        }

        // 2) Update region
        if (sub === '2') {
          if (level === 3) return res.send(L.reg_region);
          if (level === 4) {
            const region = regionMap[subValue] || 'Other';
            const { error } = await supabase.from('users').update({ region }).eq('msisdn', phoneNumber);
            if (error) throw error;
            return res.send(L.profile_updated);
          }
        }

        // 3) Update business type
        if (sub === '3') {
          if (level === 3) return res.send(L.reg_biz);
          if (level === 4) {
            const business_type = bizMap[subValue] || 'Other';
            const { error } = await supabase.from('users').update({ business_type }).eq('msisdn', phoneNumber);
            if (error) throw error;
            return res.send(L.profile_updated);
          }
        }

        // 4) Update topics (free text)
        if (sub === '4') {
          if (level === 3) return res.send(L.reg_topics);
          if (level >= 4) {
            const topics = freeText;
            const { error } = await supabase.from('users').update({ topics }).eq('msisdn', phoneNumber);
            if (error) throw error;
            return res.send(L.profile_updated);
          }
        }

        // 5) Update delivery window
        if (sub === '5') {
          if (level === 3) return res.send(L.reg_window);
          if (level === 4) {
            const delivery_window = winMap[subValue] || 'evening';
            const { error } = await supabase.from('users').update({ delivery_window }).eq('msisdn', phoneNumber);
            if (error) throw error;
            return res.send(L.profile_updated);
          }
        }

        // 6) Delete my data
        if (sub === '6') {
          const { error } = await supabase.from('users').delete().eq('msisdn', phoneNumber);
          if (error) throw error;
          return res.send(L.profile_deleted);
        }

        if (sub === '0') {
          return res.send(L.main);
        }

        return res.send(L.invalid_choice);
      }

      // New user: sequence across levels 2..6
      if (level === 2) return res.send(L.reg_region);   // pick region
      if (level === 3) return res.send(L.reg_biz);      // pick biz
      if (level === 4) return res.send(L.reg_window);   // pick window
      if (level === 5) return res.send(L.reg_confirm);  // confirm

      if (level === 6) {
        const regionSel = parts[2];
        const bizSel = parts[3];
        const winSel = parts[4];
        const confirmSel = parts[5];
        if (confirmSel !== '1') return res.send(L.invalid_choice);

        const region = regionMap[regionSel] || 'Other';
        const business_type = bizMap[bizSel] || 'Other';
        const delivery_window = winMap[winSel] || 'evening';

        const { error } = await supabase
          .from('users')
          .upsert(
            [{ msisdn: phoneNumber, locale, region, business_type, delivery_window, consent: true }],
            { onConflict: 'msisdn' }
          );
        if (error) throw error;

        await queueSms(phoneNumber, L.sms.welcome);
        return res.send(L.profile_saved);
      }

      return res.send(L.invalid_choice);
    }

    // ---------------- Daily Lessons ----------------
    if (choice1 === '2') {
      await queueSms(phoneNumber, L.sms.lesson);
      return res.send(L.lessons_end);
    }

    // ---------------- Quizzes ----------------
    if (choice1 === '3') {
      await queueSms(phoneNumber, L.sms.quiz);
      return res.send(L.quiz_end);
    }

    // ---------------- Certifications ----------------
    if (choice1 === '4') {
      await queueSms(phoneNumber, L.sms.cert);
      return res.send(L.cert_end);
    }

    // ---------------- Business Support ----------------
    if (choice1 === '5') {
      // level 2: show options, level 3: pick & SMS
      if (level === 2) {
        return res.send(L.biz_pick);
      }
      if (level === 3) {
        const topic = parts[2];
        await queueSms(phoneNumber, L.sms.biz[topic] || L.sms.biz['1']);
        return res.send(L.cert_end); // short END message (reuse)
      }
      return res.send(L.invalid_choice);
    }

    // ---------------- Agriculture Tips ----------------
    if (choice1 === '6') {
      await queueSms(phoneNumber, L.sms.agri);
      return res.send(L.lessons_end);
    }

    // ---------------- Health Tips ----------------
    if (choice1 === '7') {
      await queueSms(phoneNumber, L.sms.health);
      return res.send(L.lessons_end);
    }

    // ---------------- Helpline ----------------
    if (choice1 === '8') {
      await queueSms(phoneNumber, L.sms.helpline);
      const { error } = await supabase
        .from('helpline_tickets')
        .insert([{ msisdn: phoneNumber, topic: 'General', notes: 'USSD helpline callback request' }]);
      if (error) throw error;
      return res.send(L.thanks);
    }

    // ---------------- Talk to AI (placeholder) ----------------
    if (choice1 === '9') {
      return res.send('END AI chat coming soon.');
    }

    return res.send(I18N[locale]?.invalid_choice || I18N.en.invalid_choice);
  } catch (err) {
    console.error('USSD error:', err);
    return res.status(200).send(I18N.en.down);
  }
});

/** ---------------- Dashboard APIs ---------------- **/

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

// ---------------------------------------------------------
// Start server
// ---------------------------------------------------------
const PORT = Number(process.env.PORT || 8000);
const server = app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
