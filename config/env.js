import dotenv from "dotenv";

dotenv.config();

const required = [
  "SESSION_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
];

for (const key of required) {
  if (!process.env[key] || String(process.env[key]).trim() === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
};
