/*!
 * evolutility-server-node :: utils/user-store.ts
 * Users management (for admins): list, create, update, delete.
 *
 * Guards: an admin can't delete or deactivate themselves or remove their own
 * admin role, and the last active admin can't be removed. A new password
 * (or deactivating a user) ends the user's sessions.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import crypto from "crypto";
import config from "../../config.ts";
import { db } from "./query.ts";
import {
  hashPassword,
  minPasswordLength,
  roles,
  type Role,
  type User,
} from "./auth.ts";

const schema = '"' + (config.schema || "evolutility") + '"';
const T_USER = `${schema}.evol_user`;
const T_SESSION = `${schema}.evol_session`;

export class UserError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface UserInfo extends User {
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

const columns = `id, email, name, role, active, last_login_at AS "lastLoginAt", created_at AS "createdAt"`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const generatePassword = () => crypto.randomBytes(12).toString("base64url");

const checkEmail = (email: unknown) => {
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new UserError("A valid email is required.");
  }
  return email.trim();
};
const checkRole = (role: unknown): Role => {
  if (!roles.includes(role as Role)) {
    throw new UserError(`Role must be one of: ${roles.join(", ")}.`);
  }
  return role as Role;
};
const checkName = (name: unknown) => {
  if (
    name !== undefined &&
    name !== null &&
    (typeof name !== "string" || name.length > 200)
  ) {
    throw new UserError("The name must be a text (200 characters max).");
  }
  return typeof name === "string" ? name.trim() || null : null;
};
const checkPassword = (password: unknown) => {
  if (typeof password !== "string" || password.length < minPasswordLength) {
    throw new UserError(
      `The password must have at least ${minPasswordLength} characters.`,
    );
  }
  return password;
};

export const listUsers = () =>
  db.conn.any<UserInfo>(
    `SELECT ${columns} FROM ${T_USER} ORDER BY lower(email)`,
  );

const getUser = async (id: number) => {
  const u = await db.conn.oneOrNone<UserInfo>(
    `SELECT ${columns} FROM ${T_USER} WHERE id = $1`,
    [id],
  );
  if (!u) throw new UserError("User not found.", 404);
  return u;
};

// - number of active admins other than this user
const otherAdmins = async (id: number) =>
  (
    await db.conn.one<{ n: number }>(
      `SELECT count(*)::integer AS n FROM ${T_USER} WHERE role = 'admin' AND active AND id <> $1`,
      [id],
    )
  ).n;

export async function createUser(input: Record<string, unknown>) {
  const email = checkEmail(input.email);
  const role = checkRole(input.role ?? "viewer");
  const name = checkName(input.name);
  const generated = !input.password;
  const password = generated
    ? generatePassword()
    : checkPassword(input.password);
  const exists = await db.conn.oneOrNone(
    `SELECT id FROM ${T_USER} WHERE lower(email) = lower($1)`,
    [email],
  );
  if (exists)
    throw new UserError(`A user w/ the email "${email}" already exists.`, 409);
  const { id } = await db.conn.one<{ id: number }>(
    `INSERT INTO ${T_USER}(email, name, role, password_hash) VALUES($1, $2, $3, $4) RETURNING id`,
    [email, name, role, await hashPassword(password)],
  );
  return {
    user: await getUser(id),
    password: generated ? password : undefined,
  };
}

// - changes: name, role, active, password, or resetPassword (generated)
export async function updateUser(
  id: number,
  input: Record<string, unknown>,
  me: User,
) {
  const user = await getUser(id);
  const role = input.role === undefined ? user.role : checkRole(input.role);
  const active =
    input.active === undefined ? user.active : input.active === true;
  if (id === me.id && (role !== "admin" || !active)) {
    throw new UserError(
      "You can't remove your own admin role or deactivate yourself.",
    );
  }
  if (
    user.role === "admin" &&
    user.active &&
    (role !== "admin" || !active) &&
    !(await otherAdmins(id))
  ) {
    throw new UserError("There must be at least one active admin.");
  }
  let password: string | undefined;
  if (input.resetPassword === true) password = generatePassword();
  else if (input.password !== undefined)
    password = checkPassword(input.password);
  const name = input.name === undefined ? user.name : checkName(input.name);

  await db.conn.tx(async (t) => {
    await t.none(
      `UPDATE ${T_USER} SET name = $2, role = $3, active = $4, updated_at = timezone('utc', now())
       ${password ? ", password_hash = $5" : ""} WHERE id = $1`,
      password
        ? [id, name, role, active, await hashPassword(password)]
        : [id, name, role, active],
    );
    // - a new password or deactivation: log in again (a new role applies
    // - right away: it is read on each request)
    if (password || !active) {
      await t.none(`DELETE FROM ${T_SESSION} WHERE user_id = $1`, [id]);
    }
  });
  return {
    user: await getUser(id),
    password: input.resetPassword === true ? password : undefined,
  };
}

export async function deleteUser(id: number, me: User) {
  const user = await getUser(id);
  if (id === me.id) throw new UserError("You can't delete yourself.");
  if (user.role === "admin" && user.active && !(await otherAdmins(id))) {
    throw new UserError("There must be at least one active admin.");
  }
  await db.conn.none(`DELETE FROM ${T_USER} WHERE id = $1`, [id]);
  return { id };
}

export default { listUsers, createUser, updateUser, deleteUser };
