// Hash delle chiavi personali con scrypt (node:crypto, nessuna libreria
// esterna). Usato dal sito e dallo script `npm run chiave`.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const LUNGHEZZA = 64;
const PARAMETRI = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const deriva = (chiave, sale) =>
  new Promise((risolvi, rifiuta) =>
    scrypt(String(chiave).normalize("NFC"), sale, LUNGHEZZA, PARAMETRI, (err, h) =>
      err ? rifiuta(err) : risolvi(h)
    )
  );

export const CHIAVE_MIN = 6;
export const CHIAVE_MAX = 200;

export function chiaveValida(chiave) {
  const n = String(chiave ?? "").length;
  return n >= CHIAVE_MIN && n <= CHIAVE_MAX;
}

export async function hashChiave(chiave) {
  const sale = randomBytes(16);
  return { sale, hash: await deriva(chiave, sale) };
}

export async function verificaChiave(chiave, sale, hash) {
  const calcolato = await deriva(chiave, sale);
  return calcolato.length === hash.length && timingSafeEqual(calcolato, hash);
}
