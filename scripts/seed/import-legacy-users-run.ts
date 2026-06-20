import { db } from "../../src/lib/db";
import { users } from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// We'll bypass auth.api.getSession that calls next/headers in CLI, by interacting with db and auth directly
import { auth } from "../../src/lib/auth/config";

const LEGACY_USERS = [
  "admin@jenga365.com",
  "sunlightmulama@gmail.com",
  "sankman48@gmail.com",
  "waiyakikinyua@gmail.com",
  "cmbruce1015@gmail.com",
  "labannyanyuki@gmail.com",
  "cantonaericouko@gmail.com",
  "marvinmasiga@gmail.com",
  "armaduninnovators@gmail.com",
  "ojiambo22@gmail.com",
  "malikmalcolm0@gmail.com",
  "rckodire25@gmail.com",
  "Claudenyamiro@gmail.com",
  "barnabasowuor4@gmail.com",
  "millanamwayisaka@gmail.com",
  "wanjirucharlesk7@gmail.com",
  "sifuna1995@gmail.com",
  "emmanuelcarlton724@gmail.com",
  "shilebrian@gmail.com",
  "nestamulwa254@gmail.com",
  "ronaldreaganjuma@gmail.com",
  "mumojohn1712@gmail.com",
  "kanziraclaver@gmail.com",
  "jeremymaina213@gmail.com",
  "Omoding556@gmail.com",
  "Mokuamuturi@gmail.com",
  "ibrahimmaloba10@gmail.com",
  "arafat.yasir@mpesafoundationacademy.ac.ke",
  "obwangazephenes@gmail.com",
  "victorbradley766@gmail.com",
  "nandwagg@gmail.com"
];

async function run() {
  console.log("Starting import...");
  const results = [];

  for (const email of LEGACY_USERS) {
      try {
          const existingUser = await db.query.users.findFirst({
              where: eq(users.email, email),
          });

          if (existingUser) {
              results.push({ email, status: "skipped" });
              continue;
          }

          const tempPassword = crypto.randomBytes(16).toString("hex") + "A1!";

          await auth.api.signUpEmail({
              body: {
                  email,
                  password: tempPassword,
                  name: email.split("@")[0],
              }
          });
          results.push({ email, status: "imported" });
      } catch (err) {
          console.error(`Failed to import ${email}:`, err);
          results.push({ email, status: "error", message: err instanceof Error ? err.message : String(err) });
      }
  }

  console.log(results);
  console.log("Done");
  process.exit(0);
}

run();
