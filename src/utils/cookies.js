export const cookieBase = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
};

export const setOAuthCookies = (res, { state, verifier }) => {
  res.cookie("state", state, { ...cookieBase, maxAge: 5 * 60 * 1000 });
  res.cookie("pkce_verifier", verifier, { ...cookieBase, maxAge: 5 * 60 * 1000 });
};

export const clearOAuthCookies = (res) => {
    res.clearCookie("state", { path: "/" });
    res.clearCookie("pkce_verifier", { path: "/" });
}