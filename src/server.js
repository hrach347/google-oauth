import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

import { env } from "./config/env.js";
import { sessionConfig } from "./config/session.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


const app = express();

app.use(cookieParser());
app.use(session(sessionConfig(env)));

app.use(authRoutes)
app.use(dashboardRoutes)

app.listen(env.PORT, () => console.log(`http://localhost:${env.PORT}`));
