export const trim160 = (s) => (s || "").toString().slice(0, 160);
export const con = (text) => `CON ${trim160(text)}`;
export const end = (text) => `END ${trim160(text)}`;
export const parseText = (text) => (text || "").split("*").filter(Boolean);

export const pick = (arr, idx) => arr[Math.max(0, Math.min(arr.length - 1, idx - 1))];

export const MENU = Object.freeze({
  HOME: `
1 Register/Update
2 Learn Now
3 Quiz & Progress
4 Ask ReformHer
5 Certifications
6 Business Help
7 Agriculture (by Region)
8 Helpline
9 Settings`.trim()
});
