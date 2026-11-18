/*!
 * evolutility-server-node :: setup/user-add.ts
 * Create a user, or set a new password (and role) for an existing one.
 *
 * Usage: npm run user:add -- <email> <viewer|editor|admin> [--name="Full Name"] [--password=...]
 * Without --password, a password is generated and shown once.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import crypto from "crypto";
import { closeDb } from "../utils/query.ts";
import { minPasswordLength, roles, upsertUser, type Role } from "../utils/auth.ts";

const args = process.argv.slice(2);
const opt = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const [email, role] = args.filter((a) => !a.startsWith("--"));

const fail = (msg: string) => {
  console.error(msg);
  console.error(
    'Usage: npm run user:add -- <email> <viewer|editor|admin> [--name="Full Name"] [--password=...]',
  );
  process.exit(1);
};

if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) fail("A valid email is required.");
if (!roles.includes(role as Role)) fail(`Role must be one of: ${roles.join(", ")}.`);
const password = opt("password") || crypto.randomBytes(12).toString("base64url");
if (password.length < minPasswordLength) {
  fail(`The password must have at least ${minPasswordLength} characters.`);
}

try {
  const r = await upsertUser(email, role as Role, password, opt("name"));
  console.log(
    `${r.created ? "Created" : "Updated"} ${role} "${email}" (id ${r.id}).` +
      (opt("password") ? "" : `\nPassword: ${password}`),
  );
} catch (err) {
  console.error(
    "Could not save the user (is the table evol_user created? see evolutility-models).",
  );
  console.error((err as Error).message);
  process.exitCode = 1;
} finally {
  closeDb();
}
