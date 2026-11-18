/*!
 * evolutility-server-node :: utils/auth.ts
 * Users, passwords, sessions, and roles.
 *
 * - Passwords are hashed w/ scrypt (Node's crypto, no dependency).
 * - A session is a random token in an httpOnly cookie. The database keeps
 *   only a hash of it (table "evol_session"), so it can be revoked.
 * - Roles: viewer (read), editor (+ write records), admin (+ edit models).
 *
 * The tables are created by evolutility-models ("005_create_users").
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import crypto from "crypto";
import { promisify } from "util";
import type { NextFunction, Request, Response } from "express";
import config from "../../config.ts";
import { db } from "./query.ts";

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: crypto.ScryptOptions,
) => Promise<Buffer>;

const schema = '"' + (config.schema || "evolutility") + '"';
const T_USER = `${schema}.evol_user`;
const T_SESSION = `${schema}.evol_session`;

export const roles = ["viewer", "editor", "admin"] as const;
export type Role = (typeof roles)[number];

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: User | null;
    role?: Role | null; // - role of the request (user's role, or anonymous)
  }
}

export const authConfig = () => ({
  enabled: config.auth?.enabled !== false,
  anonymousRole: (config.auth?.anonymousRole ?? null) as Role | null,
  sessionDays: config.auth?.sessionDays || 7,
  cookieName: config.auth?.cookieName || "evol_session",
  cookieSecure: config.auth?.cookieSecure ?? false,
  cookieSameSite: config.auth?.cookieSameSite || "Strict",
});

// #region ----- Passwords -----------------------------------

const scryptParams = { N: 16384, r: 8, p: 1 };
const keyLen = 64;

// - "scrypt$N$r$p$salt$hash" (salt and hash in base64)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, keyLen, scryptParams);
  const { N, r, p } = scryptParams;
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, N, r, p, salt, hash] = (stored || "").split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return crypto.timingSafeEqual(actual, expected);
}

// - hash of a password nobody has: checked when the email is unknown, so
// - the answer takes the same time and doesn't tell which emails exist
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(crypto.randomUUID()));

export const minPasswordLength = 8;
//#endregion

// #region ----- Sessions & cookies ---------------------------

export const newToken = () => crypto.randomBytes(32).toString("base64url");
export const tokenId = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export function parseCookies(header?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  (header || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) {
      const name = part.slice(0, i).trim();
      try {
        cookies[name] = decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        // - ignore malformed values
      }
    }
  });
  return cookies;
}

export function sessionCookie(token: string, maxAgeSec: number): string {
  const c = authConfig();
  return [
    `${c.cookieName}=${token}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${c.cookieSameSite}`,
    `Max-Age=${maxAgeSec}`,
    c.cookieSecure || c.cookieSameSite === "None" ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

const userColumns = "u.id, u.email, u.name, u.role";

export async function findSessionUser(token: string): Promise<User | null> {
  return db.conn.oneOrNone<User>(
    `SELECT ${userColumns} FROM ${T_SESSION} s JOIN ${T_USER} u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > timezone('utc', now()) AND u.active`,
    [tokenId(token)],
  );
}

// - check email & password, create a session; returns null if invalid
export async function login(
  email: string,
  password: string,
): Promise<{ user: User; token: string; maxAgeSec: number } | null> {
  const row = await db.conn.oneOrNone<User & { password_hash: string; active: boolean }>(
    `SELECT ${userColumns}, u.password_hash, u.active FROM ${T_USER} u WHERE lower(u.email) = lower($1)`,
    [email],
  );
  const ok = await verifyPassword(password, row?.password_hash || (await getDummyHash()));
  if (!row || !ok || !row.active) return null;
  const token = newToken();
  const maxAgeSec = authConfig().sessionDays * 24 * 3600;
  await db.conn.tx(async (t) => {
    // - clean up old sessions while we're at it
    await t.none(`DELETE FROM ${T_SESSION} WHERE expires_at < timezone('utc', now())`);
    await t.none(
      `INSERT INTO ${T_SESSION}(id, user_id, expires_at)
       VALUES($1, $2, timezone('utc', now()) + make_interval(secs => $3))`,
      [tokenId(token), row.id, maxAgeSec],
    );
    await t.none(`UPDATE ${T_USER} SET last_login_at = timezone('utc', now()) WHERE id = $1`, [
      row.id,
    ]);
  });
  const { id, email: userEmail, name, role } = row;
  return { user: { id, email: userEmail, name, role }, token, maxAgeSec };
}

export async function logout(token: string) {
  await db.conn.none(`DELETE FROM ${T_SESSION} WHERE id = $1`, [tokenId(token)]);
}

// - create a user, or update the password (and role) of an existing one
export async function upsertUser(
  email: string,
  role: Role,
  password: string,
  name?: string,
): Promise<{ id: number; created: boolean }> {
  const hash = await hashPassword(password);
  const existing = await db.conn.oneOrNone<{ id: number }>(
    `SELECT id FROM ${T_USER} WHERE lower(email) = lower($1)`,
    [email],
  );
  if (existing) {
    await db.conn.none(
      `UPDATE ${T_USER} SET password_hash = $2, role = $3, name = COALESCE($4, name), active = true,
       updated_at = timezone('utc', now()) WHERE id = $1`,
      [existing.id, hash, role, name ?? null],
    );
    // - sessions w/ the old password end
    await db.conn.none(`DELETE FROM ${T_SESSION} WHERE user_id = $1`, [existing.id]);
    return { id: existing.id, created: false };
  }
  const r = await db.conn.one<{ id: number }>(
    `INSERT INTO ${T_USER}(email, name, role, password_hash) VALUES($1, $2, $3, $4) RETURNING id`,
    [email.trim(), name ?? null, role, hash],
  );
  return { id: r.id, created: true };
}

export async function countUsers(): Promise<number | null> {
  const exists = await db.conn.one<{ t: string | null }>("SELECT to_regclass($1) AS t", [T_USER]);
  if (!exists.t) return null;
  const r = await db.conn.one<{ n: number }>(`SELECT count(*)::integer AS n FROM ${T_USER}`);
  return r.n;
}
//#endregion

// #region ----- Roles ----------------------------------------

export const hasRole = (role: Role | null | undefined, needed: Role) =>
  !!role && roles.indexOf(role) >= roles.indexOf(needed);

// - role needed for a request (by method and path)
export function requiredRole(method: string, path: string): Role | null {
  const apiPath = config.apiPath;
  const p = path.startsWith(apiPath) ? path.slice(apiPath.length) : path;
  if (p.startsWith("auth/") || p === "version") return null; // - public
  const read = method === "GET" || method === "HEAD";
  if (p.startsWith("db/")) return "admin";
  if (p.startsWith("meta/") && !read) return "admin";
  return read ? "viewer" : "editor";
}

// - who is calling (session cookie), sets req.user and req.role
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const c = authConfig();
  if (!c.enabled) {
    req.user = null;
    req.role = "admin";
    return next();
  }
  try {
    const token = parseCookies(req.headers.cookie)[c.cookieName];
    req.user = token ? await findSessionUser(token) : null;
    req.role = req.user?.role || c.anonymousRole;
    next();
  } catch (err) {
    next(err);
  }
}

// - refuse requests w/o the role needed (401: login needed, 403: not allowed)
export function authorize(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") return next();
  const needed = requiredRole(req.method, req.path);
  if (!needed || hasRole(req.role, needed)) return next();
  if (!req.user) {
    return res.status(401).json({ error: "Login required." });
  }
  return res.status(403).json({ error: `Not allowed (${needed} role needed).` });
}
//#endregion

export default {
  hashPassword,
  verifyPassword,
  login,
  logout,
  upsertUser,
  countUsers,
  authenticate,
  authorize,
  requiredRole,
  hasRole,
};
