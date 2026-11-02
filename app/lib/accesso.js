import { createHash } from "crypto";
import { PAROLE_ONE } from "./parole-one.js";

// Parole che non contano come rima
const PAROLE_VIETATE = new Set(["one", "orione"]);

// ---- Impostazioni della rima ----
export const PAROLA_CHIAVE = "orione";

// Le lettere finali che la parola deve avere in comune con la chiave.
// slice(-3) dà "one"  → rima: passione, canzone, persone, visione...
// slice(-4) darebbe "ione" → più severa: passione, visione, emozione...
export const FINALE_RIMA = PAROLA_CHIAVE.slice(-3);

// Toglie maiuscole, spazi e accenti: "Passióne " vale come "passione"
export const normalizza = (testo) =>
  String(testo)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Controlla che la parola faccia rima con la chiave
export function faRima(parola) {
  const p = normalizza(parola);

  if (!/^[a-z]+$/.test(p)) return false; // una sola parola, solo lettere
  if (PAROLE_VIETATE.has(p)) return false; // "one" e "orione" non valgono
  if (!p.endsWith(FINALE_RIMA)) return false;

  return PAROLE_ONE.has(p); // deve essere una parola italiana vera
}

// Valore del cookie: non si può indovinare senza il SEGRETO di .env.local
export function tokenAccesso() {
  const segreto = process.env.SEGRETO;
  if (!segreto) throw new Error("Manca SEGRETO in .env.local");

  return createHash("sha256").update(segreto + "|diario").digest("hex");
}