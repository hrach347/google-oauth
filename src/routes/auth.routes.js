import { Router } from "express";
import { startGoogleAuth, googleRedirect, logout, } from "../controllers/auth.controller.js";

const router = Router();

router.get("/auth/google", startGoogleAuth);
router.get("/redirect", googleRedirect);
router.get("/logout", logout);

export default router;
