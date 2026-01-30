import crypto from "crypto"

export const makePkce = (bytes = 32) => {
    const verifier = crypto.randomBytes(bytes).toString("hex");
    const challenge = crypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64url");

    return { verifier, challenge }
}