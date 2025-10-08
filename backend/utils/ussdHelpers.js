// utils/ussdHelpers.js

// Most gateways allow ~182 chars per USSD screen.
// Keep it configurable but default to 182.
export const MAX_USSD_LEN = 182;

export const trimTo = (s, n = MAX_USSD_LEN) => (s || "").toString().slice(0, n);
export const trim160 = (s) => trimTo(s, 160); // kept for backwards compatibility where needed

// Wrap with CON/END and trim to the standard USSD limit
export const con = (text, max = MAX_USSD_LEN) => `CON ${trimTo(text, max)}`;
export const end = (text, max = MAX_USSD_LEN) => `END ${trimTo(text, max)}`;

// Split raw USSD text like "1*2*3" → ["1","2","3"]
export const parseText = (text) => (text || "").split("*").filter(Boolean);

// Safe picker for 1-based user selections
export const pick = (arr, idx) => arr[Math.max(0, Math.min(arr.length - 1, (idx || 1) - 1))];

// Single-language fallback home menu (i18n-specific menus live in the route)
// This is only used if you need a generic HOME string.
export const MENU = Object.freeze({
  HOME: `
1 Register / Update profile
2 Daily Lessons
3 Quizzes
4 Certifications
5 Business Support
6 Agriculture Tips
7 Health Tips
8 Helpline
9 Talk to AI
0 Exit`.trim(),
});
