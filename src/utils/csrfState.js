import crypto from "crypto"

export const makeState = (bytes = 16) => {
    return crypto.randomBytes(bytes).toString("hex");
}