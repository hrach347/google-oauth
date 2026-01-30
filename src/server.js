import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { env } from "../config/env.js";
import session from "express-session";
import { OAuth2Client } from "google-auth-library";
import { sessionConfig } from "../config/session.js";


const app = express();

app.use(cookieParser());
app.use(session(sessionConfig(env)));

const oauth = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
});

const cookieBase = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
};

app.get("/auth/google", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const verifier = crypto.randomBytes(32).toString("hex");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  res.cookie("state", state, {
    ...cookieBase,
    maxAge: 5 * 60 * 1000,
  });
  res.cookie("pkce_verifier", verifier, {
    ...cookieBase,
    maxAge: 5 * 60 * 1000,
  });

  const url = oauth.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  res.redirect(url);
});

app.get("/redirect", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const cookieState = String(req.cookies.state || "");
    const verifier = String(req.cookies.pkce_verifier || "");

    if (!code) return res.status(400).json("NO CODE");
    if (!state) return res.status(400).json("NO STATE");
    if (!verifier) return res.status(400).json("NO PKCE VERIFIER");

    if (cookieState !== state) {
      return res.status(400).json("STATE DID NOT MATCH");
    }

    res.clearCookie("state", { path: "/" });
    res.clearCookie("pkce_verifier", { path: "/" });

    const { tokens } = await oauth.getToken({
      code,
      codeVerifier: verifier,
    });

    if (!tokens.id_token) return res.status(400).json("NO ID TOKEN");

    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const user = ticket.getPayload();

    req.session.regenerate((err) => {
      if (err) return res.status(500).json("SESSION FAILED");
      req.session.user = {
        id: user.sub,
        email: user.email,
        name: user.name,
      };
      res.json(user);
    });
  } catch (error) {
    return res.status(500).json("OAUTH FAILED");
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.status(401).json("LOGIN BITCH!");
  res.json(req.session.user);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json("SUCCESSFULLY LOGGED OUT");
  });
});

app.listen(3000, () => console.log("http://localhost:3000"));
