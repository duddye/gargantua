import { ELENCO_SEZIONI } from "./sezioni";

// Le voci della Mappa stellare (navigazione)
export const VOCI_MAPPA = [
  { percorso: "/welcome", simbolo: "●", titolo: "Singolarità", sotto: "Inizio" },
  ...ELENCO_SEZIONI.map((s) => ({
    percorso: s.percorso,
    simbolo: s.simbolo,
    titolo: s.titolo,
    sotto: s.breve,
  })),
  { percorso: "/profilo", simbolo: "◍", titolo: "Profilo", sotto: "Chiave e uscita" },
];
