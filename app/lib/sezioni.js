// =========================================================
// LE SEZIONI DEL DIARIO
// Ogni sezione descrive la sua tabella, i campi, i filtri e
// gli ordinamenti. Da qui nascono moduli, elenco, validazione
// e query. Solo tabelle e colonne elencate qui sono scrivibili.
//
// Tipi di campo:
//   testo · area · numero · data · scelta (menu) · scala (pulsanti)
//   multi (caselle, salvate in una tabella ponte)
// Opzioni: `opzioni` fisse oppure `fonte` = tabella di riferimento
// Ruoli nell'elenco: "titolo" (in grande), "corpo" (paragrafo),
//   "intestazione" (riga in alto), gli altri come etichette.
// Predefiniti speciali: "oggi".
// `automatico`: campo autore, riempito dal server con la persona collegata.
// =========================================================

const perPersona = {
  nome: "per_persona",
  etichetta: "Per chi",
  tipo: "scelta",
  fonte: "persone",
  formato: (o) => `Orbita di ${o.etichetta} · solo per ${o.etichetta}`,
  vuoto: "Entangled · insieme",
};

// Autore: non compare nei moduli, lo mette il server (persona collegata)
const persona = (nome, etichetta, extra = {}) => ({
  nome,
  etichetta,
  tipo: "scelta",
  fonte: "persone",
  automatico: true,
  ...extra,
});

const scala = (nome, etichetta, basso, alto) => ({
  nome,
  etichetta,
  tipo: "scala",
  opzioni: ["1", "2", "3", "4", "5"].map((v) => ({ valore: v, etichetta: v })),
  estremi: [basso, alto],
});

const STELLE = [1, 2, 3, 4, 5].map((n) => ({
  valore: String(n),
  etichetta: "★".repeat(n),
}));

const ORDINE_RECENTI = { recenti: "Più recenti", vecchi: "Più vecchie" };

export const SEZIONI = {
  // -------------------------------------------------------
  bacheca: {
    breve: "Cose da fare insieme",
    percorso: "/bacheca",
    tabella: "voci",
    titolo: "Bacheca",
    sottotitolo: "Film, libri, serie, piatti, viaggi: tutto ciò che vogliamo fare",
    simbolo: "✶",
    nuovo: "Aggiungi all'orizzonte",
    invia: "Aggiungi",
    vuoto: "Nessuna voce in questa regione di cielo.",
    campi: [
      { nome: "banda", etichetta: "Banda", tipo: "scelta", fonte: "bande", obbligatorio: true, ruolo: "intestazione" },
      { nome: "titolo", etichetta: "Titolo", tipo: "testo", obbligatorio: true, max: 300, ruolo: "titolo" },
      { nome: "dettaglio", etichetta: "Di / dove", tipo: "testo", max: 200, segnaposto: "autore, regia, luogo…" },
      { nome: "anno", etichetta: "Anno", tipo: "numero", min: 1000, max: 2100 },
      { nome: "stato", etichetta: "Stato", tipo: "scelta", fonte: "stati_voce", obbligatorio: true, predefinito: "nebulosa" },
      { nome: "voto", etichetta: "Luminosità", tipo: "scala", opzioni: STELLE },
      perPersona,
      persona("aggiunta_da", "Aggiunta da"),
      { nome: "note", etichetta: "Note", tipo: "area", max: 5000, ruolo: "corpo" },
    ],
    filtri: {
      ricerca: ["titolo", "dettaglio", "note"],
      liste: ["banda", "stato", "aggiunta_da"],
      orbita: true,
      votoMinimo: "voto",
      faccette: ["banda", "stato"],
    },
    ordinamenti: {
      recenti: ["Più recenti", "t.creato_il desc"],
      stato: ["Per stato", "(select s.ordine from stati_voce s where s.codice = t.stato), t.creato_il desc"],
      banda: ["Per banda", "(select b.ordine from bande b where b.codice = t.banda), t.titolo"],
      titolo: ["Titolo A→Z", "lower(t.titolo), t.id"],
      voto: ["Più luminose", "t.voto desc nulls last, t.creato_il desc"],
      anno: ["Anno", "t.anno desc nulls last, t.titolo"],
      vecchi: ["Più vecchie", "t.creato_il asc"],
    },
  },

  // -------------------------------------------------------
  telemetria: {
    breve: "Umore e salute",
    percorso: "/telemetria",
    tabella: "rilevazioni",
    titolo: "Telemetria",
    sottotitolo: "Diario di bordo: umore e parametri vitali",
    simbolo: "∿",
    nuovo: "Nuova rilevazione",
    invia: "Registra",
    vuoto: "Nessuna rilevazione in questo periodo.",
    andamento: true,
    soloAutore: "persona", // solo chi l'ha registrata può modificarla

    campi: [
      persona("persona", "Chi", { ruolo: "intestazione" }),
      { nome: "giorno", etichetta: "Giorno", tipo: "data", obbligatorio: true, predefinito: "oggi", ruolo: "intestazione" },
      { nome: "umore", etichetta: "Umore", tipo: "scala", fonte: "livelli_umore", obbligatorio: true, ruolo: "titolo" },
      scala("energia", "Energia", "scarica", "carica"),
      scala("stress", "Stress", "zero", "alle stelle"),
      scala("benessere_fisico", "Benessere fisico", "dolorante", "in forma"),
      { nome: "sonno_ore", etichetta: "Ore di sonno", tipo: "numero", min: 0, max: 24, passo: 0.5 },
      {
        nome: "emozioni",
        etichetta: "Emozioni",
        tipo: "multi",
        fonte: "emozioni",
        ponte: { tabella: "rilevazione_emozioni", chiave: "rilevazione_id", valore: "emozione" },
      },
      { nome: "causa", etichetta: "Causa / nota", tipo: "area", max: 2000, ruolo: "corpo", segnaposto: "Cosa ha mosso la giornata?" },
    ],
    filtri: {
      liste: ["persona"],
      periodo: "giorno",
      faccette: ["persona"],
    },
    ordinamenti: {
      recenti: ["Più recenti", "t.giorno desc, t.creato_il desc"],
      vecchi: ["Più vecchie", "t.giorno asc, t.creato_il asc"],
      umore: ["Umore più alto", "t.umore desc, t.giorno desc"],
    },
  },

  // -------------------------------------------------------
  pensieri: {
    breve: "Idee strane",
    percorso: "/pensieri",
    tabella: "pensieri",
    titolo: "Materia oscura",
    sottotitolo: "Pensieri filosofici, idee strane, domande senza risposta",
    simbolo: "◐",
    nuovo: "Nuova fluttuazione quantistica",
    invia: "Lascia fluttuare",
    vuoto: "Il vuoto quantistico è silenzioso. Per ora.",
    campi: [
      { nome: "testo", etichetta: "Pensiero", tipo: "area", obbligatorio: true, max: 5000, ruolo: "corpo" },
      persona("autore", "Da"),
      perPersona,
    ],
    filtri: {
      ricerca: ["testo"],
      liste: ["autore"],
      orbita: true,
    },
    ordinamenti: {
      recenti: [ORDINE_RECENTI.recenti, "t.creato_il desc"],
      vecchi: [ORDINE_RECENTI.vecchi, "t.creato_il asc"],
    },
  },

  // -------------------------------------------------------
  missioni: {
    breve: "Progetti",
    percorso: "/missioni",
    tabella: "missioni",
    titolo: "Missioni",
    sottotitolo: "Progetti da costruire",
    simbolo: "⟁",
    nuovo: "Pianifica una missione",
    invia: "Lancia",
    vuoto: "Nessuna missione in programma. La rampa è libera.",
    campi: [
      { nome: "titolo", etichetta: "Missione", tipo: "testo", obbligatorio: true, max: 300, ruolo: "titolo" },
      { nome: "stato", etichetta: "Stato", tipo: "scelta", fonte: "stati_missione", obbligatorio: true, predefinito: "progettazione" },
      { nome: "lancio", etichetta: "Finestra di lancio", tipo: "data" },
      perPersona,
      persona("aggiunta_da", "Aggiunta da"),
      { nome: "descrizione", etichetta: "Piano di volo", tipo: "area", max: 5000, ruolo: "corpo" },
    ],
    filtri: {
      ricerca: ["titolo", "descrizione"],
      liste: ["stato", "aggiunta_da"],
      orbita: true,
      faccette: ["stato"],
    },
    ordinamenti: {
      stato: ["Per stato", "(select s.ordine from stati_missione s where s.codice = t.stato), t.lancio asc nulls last, t.creato_il desc"],
      lancio: ["Prossimo lancio", "t.lancio asc nulls last"],
      recenti: [ORDINE_RECENTI.recenti, "t.creato_il desc"],
    },
  },
};

export const ELENCO_SEZIONI = Object.entries(SEZIONI).map(([chiave, s]) => ({
  chiave,
  ...s,
}));

export const sezione = (chiave) => {
  const s = Object.hasOwn(SEZIONI, chiave) ? SEZIONI[chiave] : null;
  if (!s) throw new Error(`Sezione sconosciuta: ${chiave}`);
  return s;
};

export const campo = (s, nome) => s.campi.find((c) => c.nome === nome);

// ---------------------------------------------------------
// OPZIONI E PREDEFINITI
// ---------------------------------------------------------

export function opzioniDi(campo, R) {
  const base = campo.opzioni ?? R[campo.fonte] ?? [];
  return campo.formato
    ? base.map((o) => ({ ...o, etichetta: campo.formato(o) }))
    : base;
}

export function oggiRoma() {
  // "AAAA-MM-GG" nel fuso di Roma
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(
    new Date()
  );
}

export function predefinito(campo) {
  if (campo.predefinito === "oggi") return oggiRoma();
  return campo.predefinito ?? (campo.tipo === "multi" ? [] : "");
}

// ---------------------------------------------------------
// VALIDAZIONE: dal FormData ai valori per il database.
// Ignora tutto ciò che non è un campo dichiarato.
// Restituisce { colonne, multi } (multi = valori per le tabelle ponte).
// ---------------------------------------------------------

export function leggiCampi(s, formData, R) {
  const colonne = {};
  const multi = {};

  for (const c of s.campi) {
    if (c.automatico) continue;

    if (c.tipo === "multi") {
      const ammessi = new Set(opzioniDi(c, R).map((o) => o.valore));
      multi[c.nome] = [...new Set(formData.getAll(c.nome).map(String))].filter(
        (v) => ammessi.has(v)
      );
      continue;
    }

    const grezzo = String(formData.get(c.nome) ?? "").trim();
    let valore = null;

    if (c.tipo === "testo" || c.tipo === "area") {
      valore = grezzo ? grezzo.slice(0, c.max ?? 5000) : null;
    } else if (c.tipo === "numero") {
      const n = c.passo ? Number.parseFloat(grezzo.replace(",", ".")) : Number.parseInt(grezzo, 10);
      valore =
        Number.isFinite(n) &&
        (c.min == null || n >= c.min) &&
        (c.max == null || n <= c.max)
          ? n
          : null;
    } else if (c.tipo === "scelta" || c.tipo === "scala") {
      const ammesso = opzioniDi(c, R).some((o) => o.valore === grezzo);
      valore = ammesso ? grezzo : null;
      // le scale sono numeri nel database
      if (valore != null && c.tipo === "scala") valore = Number(valore);
    } else if (c.tipo === "data") {
      valore = /^\d{4}-\d{2}-\d{2}$/.test(grezzo) ? grezzo : null;
    }

    if (c.obbligatorio && valore == null) {
      throw new Error(`Campo obbligatorio mancante: ${c.etichetta}`);
    }

    colonne[c.nome] = valore;
  }

  return { colonne, multi };
}

// ---------------------------------------------------------
// FILTRI: dai searchParams a un oggetto pulito e validato
// ---------------------------------------------------------

const comeLista = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export const PERIODI = [
  { valore: "7", etichetta: "Ultima settimana" },
  { valore: "30", etichetta: "Ultimo mese" },
  { valore: "90", etichetta: "Ultimi 3 mesi" },
  { valore: "365", etichetta: "Ultimo anno" },
  { valore: "tutto", etichetta: "Da sempre" },
];

export function leggiFiltri(s, sp, R) {
  const f = s.filtri ?? {};
  const filtri = { liste: {} };

  if (f.ricerca) filtri.q = String(comeLista(sp.q)[0] ?? "").trim().slice(0, 100);

  for (const nome of f.liste ?? []) {
    const ammessi = new Set(opzioniDi(campo(s, nome), R).map((o) => o.valore));
    filtri.liste[nome] = comeLista(sp[nome]).map(String).filter((v) => ammessi.has(v));
  }

  if (f.orbita) {
    const per = String(comeLista(sp.per)[0] ?? "");
    filtri.per =
      per === "entangled" || R.persone.some((p) => p.valore === per) ? per : "";
  }

  if (f.votoMinimo) {
    const v = Number.parseInt(comeLista(sp.voto_min)[0], 10);
    filtri.votoMinimo = v >= 1 && v <= 5 ? v : null;
  }

  if (f.periodo) {
    const p = String(comeLista(sp.periodo)[0] ?? "30");
    filtri.periodo = PERIODI.some((x) => x.valore === p) ? p : "30";
  }

  const ordina = String(comeLista(sp.ordina)[0] ?? "");
  filtri.ordina = Object.hasOwn(s.ordinamenti, ordina)
    ? ordina
    : Object.keys(s.ordinamenti)[0];

  return filtri;
}

export function filtriAttivi(filtri) {
  return (
    Boolean(filtri.q) ||
    Object.values(filtri.liste).some((l) => l.length) ||
    Boolean(filtri.per) ||
    Boolean(filtri.votoMinimo)
  );
}
