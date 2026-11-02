"use server";

import { redirect } from "next/navigation";
import { faRima, normalizza } from "./lib/accesso";
import { db } from "./lib/db";
import { verificaChiave } from "./lib/chiavi";
import {
  apriSessione,
  personaCollegata,
  segnaRimaSuperata,
} from "./lib/sessione";

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------
// 1. IDENTIFICAZIONE: persona + chiave personale
// ---------------------------------------------------------

export async function accedi(statoPrecedente, formData) {
  const persona = String(formData.get("persona") ?? "");
  const chiave = String(formData.get("chiave") ?? "");
  const tentativo = (statoPrecedente?.tentativo ?? 0) + 1;

  const sql = db();
  const [riga] = await sql`
    select c.sale, c.hash
    from persone p
    left join chiavi c on c.persona = p.codice
    where p.codice = ${persona}
  `;

  if (!riga) return { errore: "persona", tentativo };
  if (!riga.hash) return { errore: "senza_chiave", tentativo };

  const ok = chiave.length <= 200 && (await verificaChiave(chiave, riga.sale, riga.hash));
  if (!ok) {
    await pausa(600); // rallenta chi prova a indovinare
    return { errore: "chiave", tentativo };
  }

  await apriSessione(persona);
  redirect("/"); // ora si passa al cancello della rima
}

// ---------------------------------------------------------
// 2. CANCELLO DELLA RIMA (con contatore delle parole)
// ---------------------------------------------------------

export async function verifica(statoPrecedente, formData) {
  const persona = await personaCollegata();
  if (!persona) redirect("/");

  const grezza = String(formData.get("parola") ?? "");
  const riuscita = faRima(grezza);

  // Contatore: ogni parola provata, con chi e com'è andata
  const parola = normalizza(grezza).slice(0, 100);
  if (parola) {
    const sql = db();
    await sql`
      insert into parole_accesso (parola, persona, riuscita)
      values (${parola}, ${persona}, ${riuscita})
    `;
  }

  if (riuscita) {
    await segnaRimaSuperata();
    // Il redirect lo fa il client, dopo l'animazione della costellazione
    return { successo: true };
  }

  // Contatore: ogni tentativo sbagliato fa ripartire l'effetto rosso
  return { errore: true, tentativo: (statoPrecedente?.tentativo ?? 0) + 1 };
}
