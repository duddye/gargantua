// Imposta (o reimposta) la chiave personale di una persona.
//
//   npm run chiave -- jo        → chiede la chiave
//   npm run chiave -- alix
//
// Su Vercel/Neon: DATABASE_URL=... node scripts/imposta-chiave.mjs jo
// Poi ognuno può cambiarla dalla pagina /profilo.

import { createInterface } from "node:readline";
import postgres from "postgres";
import { hashChiave, chiaveValida, CHIAVE_MIN, CHIAVE_MAX } from "../app/lib/chiavi.js";

const persona = process.argv[2];
const url = process.env.DATABASE_URL;

if (!url) {
  console.error("Manca DATABASE_URL (in .env.local o nell'ambiente).");
  process.exit(1);
}
if (!persona) {
  console.error("Uso: npm run chiave -- <persona>   (es. jo, alix)");
  process.exit(1);
}

// Legge la chiave senza mostrarla mentre la scrivi
function chiediNascosto(domanda) {
  return new Promise((risolvi) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const scrivi = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (s) => scrivi(s.startsWith(domanda) ? s : "");
    rl.question(domanda, (risposta) => {
      rl.close();
      process.stdout.write("\n");
      risolvi(risposta);
    });
  });
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

try {
  const [p] = await sql`select nome from persone where codice = ${persona}`;
  if (!p) {
    const tutte = await sql`select codice from persone order by codice`;
    console.error(`Persona sconosciuta: ${persona}. Possibili: ${tutte.map((t) => t.codice).join(", ")}`);
    process.exitCode = 1;
  } else {
    // CHIAVE nell'ambiente: utile per script non interattivi
    const chiave = process.env.CHIAVE ?? (await chiediNascosto(`Nuova chiave per ${p.nome}: `));
    const conferma = process.env.CHIAVE ?? (await chiediNascosto("Ripetila: "));

    if (!chiaveValida(chiave)) {
      console.error(`La chiave deve avere tra ${CHIAVE_MIN} e ${CHIAVE_MAX} caratteri.`);
      process.exitCode = 1;
    } else if (chiave !== conferma) {
      console.error("Le due chiavi non coincidono.");
      process.exitCode = 1;
    } else {
      const { sale, hash } = await hashChiave(chiave);
      await sql`
        insert into chiavi (persona, sale, hash) values (${persona}, ${sale}, ${hash})
        on conflict (persona) do update
          set sale = excluded.sale, hash = excluded.hash, modificata_il = now()
      `;
      console.log(`Chiave di ${p.nome} impostata.`);
    }
  }
} finally {
  await sql.end();
}
