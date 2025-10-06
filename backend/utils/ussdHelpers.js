export const trim160 = (s) => (s || "").toString().slice(0, 160);
export const con = (text) => `CON ${trim160(text)}`;
export const end = (text) => `END ${trim160(text)}`;
export const parseText = (text) => (text || "").split("*").filter(Boolean);
