import { createOAuthClient } from "../config/oauth.js";
import { env } from "../config/env.js";
import { clearOAuthCookies, setOAuthCookies } from "../utils/cookies.js"
import { makePkce } from "../utils/pkce.js";
import { makeState } from "../utils/csrfState.js";

const oauth = createOAuthClient(env);

export const startGoogleAuth = (req, res) => {
  const state = makeState()
  const { verifier, challenge } = makePkce()

  setOAuthCookies(res, { state, verifier })

  const url = oauth.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  res.redirect(url);
};

export const googleRedirect = async (req, res) => {
  try {
    const code = String(req.query.code || "").trim();
    const state = String(req.query.state || "").trim();
    const cookieState = String(req.cookies.state || "").trim();
    const verifier = String(req.cookies.pkce_verifier || "").trim();

    if (!code) return res.status(400).json("NO CODE");
    if (!state) return res.status(400).json("NO STATE");
    if (!verifier) return res.status(400).json("NO PKCE VERIFIER");
    if (cookieState !== state) return res.status(400).json("STATE DID NOT MATCH");

    clearOAuthCookies(res)

    const { tokens } = await oauth.getToken({ code, codeVerifier: verifier });
    if (!tokens.id_token) return res.status(400).json("NO ID TOKEN");

    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const user = ticket.getPayload();

    req.session.regenerate((err) => {
      if (err) return res.status(500).json("SESSION FAILED");
      req.session.user = { id: user.sub, email: user.email, name: user.name };
      res.json(user);
    })
  } catch (error) {
    res.json({ error: error.message })
  }
};

export const logout = (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie("sid");
      res.json("SUCCESSFULLY LOGGED OUT");
    });
  } catch (error) {
    res.json({ error: error.message })
  }
}