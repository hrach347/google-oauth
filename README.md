# google-oauth

Minimal **Google OAuth 2.0 (Auth Code + PKCE S256 + state)** with **Express sessions**.  

This project is a minimal and security-focused reference implementation of **Google OAuth 2.0 Authorization Code Flow** in an Express server, hardened with **PKCE (S256)** and **state** validation, and completed with **server-side session management** (`express-session`).

Instead of exposing tokens to the browser, the app:
- completes the OAuth exchange on the server,
- verifies the returned **ID token** cryptographically,
- then stores a **minimal user identity** in the session (`req.session.user`).

This pattern keeps authentication **backend-driven**, avoids token storage in localStorage, and gives you a clean base for building protected pages/APIs (like `/dashboard`) with a standard session cookie (`sid`).

### Security model (what it protects against)
- **OAuth CSRF / login swapping:** `state` is generated per-login attempt and must match the cookie value on callback.
- **Authorization code interception:** PKCE binds the code exchange to the original client that initiated the flow (S256 challenge/verifier).
- **Session fixation:** the session is regenerated right after successful login before attaching user data.
- **Client-side token leakage:** tokens are never stored in the browser; only the session id is stored in an HTTP-only cookie.


Login via `/auth/google`,
callback on `/redirect`, 
protected `/dashboard`, 
logout `/logout`.

---

## Setup

### Install dependencies and Run
```bash
npm install
npm run dev      # nodemon
# or
npm start        # node
```
### Create .env
- SESSION_SECRET=put_a_long_random_secret_here
- GOOGLE_CLIENT_ID=your_google_client_id
- GOOGLE_CLIENT_SECRET=your_google_client_secret
- GOOGLE_REDIRECT_URI=your_host/redirect

### Routes
- GET /auth/google — starts Google OAuth (sets state + PKCE cookies, redirects to Google)
- GET /redirect — callback (validates state, exchanges code with PKCE, creates session)
- GET /dashboard — protected route (returns req.session.user)

## Enjoy
Build cool stuff. Break it. Fix it. Ship it. 😄
