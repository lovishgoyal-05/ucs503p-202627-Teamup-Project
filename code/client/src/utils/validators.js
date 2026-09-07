export const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const required = value => Boolean(String(value || "").trim());
