"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as dati from "../lib/dati";
import { db } from "../lib/db";
import { verificaAccesso, chiudiSessione } from "../lib/sessione";
import {
  chiaveValida,
  hashChiave,
  verificaChiave,
  CHIAVE_MIN,
  CHIAVE_MAX,
} from "../lib/chiavi";

// Le azioni dei moduli. Il controllo di accesso è dentro lib/dati.js
// (e qui per l'identità), così vale anche per chi chiama queste azioni
// con una POST diretta.

export async function creaVoce(chiave, formData) {
  await dati.crea(chiave, formData);
  refresh();
}

export async function aggiornaVoce(chiave, id, formData) {
  await dati.aggiorna(chiave, id, formData);
  refresh();
}

export async function eliminaVoce(chiave, id) {
  await dati.elimina(chiave, id);
  refresh();
}

// ---- Singolarità ----

export async function inviaMessaggio(formData) {
  await dati.inviaMessaggio(formData.get("testo"));
  refresh();
}

export async function ritiraMessaggio(id) {
  await dati.ritiraMessaggio(id);
  refresh();
}

// ---- Profilo ----

export async function cambiaChiave(statoPrecedente, formData) {
  const io = await verificaAccesso();
  const attuale = String(formData.get("attuale") ?? "");
  const nuova = String(formData.get("nuova") ?? "");
  const conferma = String(formData.get("conferma") ?? "");

  if (!chiaveValida(nuova)) {
    return { errore: `La nuova chiave deve avere tra ${CHIAVE_MIN} e ${CHIAVE_MAX} caratteri.` };
  }
  if (nuova !== conferma) {
    return { errore: "Le due nuove chiavi non coincidono." };
  }

  const sql = db();
  const [riga] = await sql`select sale, hash from chiavi where persona = ${io}`;
  if (!riga || !(await verificaChiave(attuale, riga.sale, riga.hash))) {
    return { errore: "La chiave attuale non è corretta." };
  }

  const { sale, hash } = await hashChiave(nuova);
  await sql`
    update chiavi set sale = ${sale}, hash = ${hash}, modificata_il = now()
    where persona = ${io}
  `;
  return { ok: true };
}

export async function esci() {
  await chiudiSessione();
  redirect("/");
}
