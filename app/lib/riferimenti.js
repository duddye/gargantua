import "server-only";

import { cache } from "react";
import { db } from "./db";
import { verificaAccesso } from "./sessione";

// =========================================================
// TABELLE DI RIFERIMENTO
// Persone, bande, stati, livelli d'umore, emozioni: stanno nel
// database (terza forma normale). Lette una volta per richiesta
// e trasformate in opzioni { valore, etichetta } per i moduli.
// =========================================================

export const riferimenti = cache(async () => {
  await verificaAccesso();
  const sql = db();

  const [persone, bande, statiVoce, statiMissione, umori, emozioni] =
    await Promise.all([
      sql`select codice, nome from persone order by nome`,
      sql`select codice, etichetta, simbolo from bande order by ordine`,
      sql`select codice, etichetta from stati_voce order by ordine`,
      sql`select codice, etichetta from stati_missione order by ordine`,
      sql`select valore, nome, descrizione from livelli_umore order by valore`,
      sql`select codice, etichetta from emozioni order by ordine`,
    ]);

  return {
    persone: persone.map((p) => ({ valore: p.codice, etichetta: p.nome })),
    bande: bande.map((b) => ({
      valore: b.codice,
      etichetta: b.etichetta,
      simbolo: b.simbolo,
    })),
    stati_voce: statiVoce.map((s) => ({ valore: s.codice, etichetta: s.etichetta })),
    stati_missione: statiMissione.map((s) => ({
      valore: s.codice,
      etichetta: s.etichetta,
    })),
    livelli_umore: umori.map((u) => ({
      valore: String(u.valore),
      etichetta: `${u.nome} · ${u.descrizione}`,
      nome: u.nome,
    })),
    emozioni: emozioni.map((e) => ({ valore: e.codice, etichetta: e.etichetta })),
  };
});

// La persona collegata (dalla sessione)
export const leggiIo = cache(async () => verificaAccesso());

export const nomePersona = (R, codice) =>
  R.persone.find((p) => p.valore === codice)?.etichetta ?? codice;

export const nomeOrbita = (R, perPersona) =>
  perPersona ? `Orbita di ${nomePersona(R, perPersona)}` : "Entangled";
