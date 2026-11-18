/*!
 * evolutility-server-node :: auth-api.ts
 * REST end-points to log in and out: auth/login, auth/logout, auth/me.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger.ts";
import { badRequest } from "./utils/errors.ts";
import auth, { authConfig, parseCookies, sessionCookie } from "./utils/auth.ts";

// - slow down password guessing (failed logins only)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many failed logins, try again later." },
});

// - POST auth/login { email, password }
export async function login(req: Request, res: Response) {
  logger.logReq("LOGIN", req);
  const { email, password } = (req.body || {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return badRequest(res, "Email and password are required.");
  }
  try {
    const r = await auth.login(email, password);
    if (!r) {
      return badRequest(res, "Invalid email or password.", 401);
    }
    res.setHeader("Set-Cookie", sessionCookie(r.token, r.maxAgeSec));
    return res.json({ user: r.user });
  } catch (err) {
    logger.logError(err);
    return badRequest(res, "Login is not available (users table missing?).", 500);
  }
}

// - POST auth/logout
export async function logout(req: Request, res: Response) {
  logger.logReq("LOGOUT", req);
  const token = parseCookies(req.headers.cookie)[authConfig().cookieName];
  try {
    if (token) await auth.logout(token);
  } catch (err) {
    logger.logError(err);
  }
  res.setHeader("Set-Cookie", sessionCookie("", 0));
  return res.json({ ok: true });
}

// - GET auth/me: the current user (null if not logged in) and role
export function me(req: Request, res: Response) {
  return res.json({
    authEnabled: authConfig().enabled,
    user: req.user || null,
    role: req.role || null,
  });
}

export default { login, logout, me, loginLimiter };
