import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { tokenAccesso } from "./accesso";
import { db } from "./db";

// =========================================================
// ACCESSO IN DUE PASSI
//  1. Identificazione: persona + chiave → cookie "sessione"
//     (token casuale; nel database solo il suo hash)
//  2. Cancello della rima → cookie "accesso"
// =========================================================

export const COOKIE_SESSIONE = "sessione";
export const COOKIE_ACCESSO = "accesso";
const DURATA_GIORNI = 30;

const opzioniCookie = (giorni) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * giorni,
  path: "/",
});

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

// Chi è collegato (o null). Una query per richiesta.
export const personaCollegata = cache(async () => {
  const biscotti = await cookies();
  const token = biscotti.get(COOKIE_SESSIONE)?.value;
  if (!token || token.length > 200) return null;

  const sql = db();
  const [s] = await sql`
    select persona from sessioni
    where token_hash = ${hashToken(token)} and scade_il > now()
  `;
  return s?.persona ?? null;
});

export async function apriSessione(persona) {
  const token = randomBytes(32).toString("base64url");
  const sql = db();

  await sql`delete from sessioni where scade_il < now()`;
  await sql`
    insert into sessioni (token_hash, persona, scade_il)
    values (${hashToken(token)}, ${persona},
            now() + ${`${DURATA_GIORNI} days`}::interval)
  `;

  const biscotti = await cookies();
  biscotti.set(COOKIE_SESSIONE, token, opzioniCookie(DURATA_GIORNI));
}

export async function chiudiSessione() {
  const biscotti = await cookies();
  const token = biscotti.get(COOKIE_SESSIONE)?.value;
  if (token) {
    const sql = db();
    await sql`delete from sessioni where token_hash = ${hashToken(token)}`;
  }
  biscotti.delete(COOKIE_SESSIONE);
  biscotti.delete(COOKIE_ACCESSO);
}

// ---- Cancello della rima ----

export async function rimaSuperata() {
  const biscotti = await cookies();
  const valore = biscotti.get(COOKIE_ACCESSO)?.value ?? "";
  const atteso = tokenAccesso();
  return (
    valore.length === atteso.length &&
    timingSafeEqual(Buffer.from(valore), Buffer.from(atteso))
  );
}

export async function segnaRimaSuperata() {
  const biscotti = await cookies();
  biscotti.set(COOKIE_ACCESSO, tokenAccesso(), opzioniCookie(DURATA_GIORNI));
}

// Va chiamata in OGNI lettura e in OGNI Server Action:
// le azioni sono raggiungibili con una POST diretta.
// Restituisce la persona collegata.
export async function verificaAccesso() {
  const persona = await personaCollegata();
  if (!persona || !(await rimaSuperata())) redirect("/");
  return persona;
}
