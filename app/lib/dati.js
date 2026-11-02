import "server-only";

import { db } from "./db";
import { verificaAccesso } from "./sessione";
import { riferimenti } from "./riferimenti";
import { sezione, leggiCampi, leggiFiltri } from "./sezioni";

// =========================================================
// ACCESSO AI DATI
// Ogni funzione verifica il cookie prima di toccare il database.
// Tabelle e colonne arrivano solo dalla configurazione (sezioni.js);
// i valori passano sempre come parametri.
// =========================================================

function identificativo(id) {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Id non valido");
  return n;
}

const unisci = (sql, frammenti, separatore) =>
  frammenti.reduce(
    (acc, f, i) => (i === 0 ? f : sql`${acc} ${sql.unsafe(separatore)} ${f}`),
    null
  );

// Condizioni WHERE dai filtri (escludendo eventualmente un campo,
// per contare le faccette di quel campo)
function condizioni(sql, s, filtri, escludi) {
  const cond = [];
  const f = s.filtri ?? {};

  if (filtri.q) {
    const motivo = `%${filtri.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const campi = f.ricerca.map((c) => sql`t.${sql(c)} ilike ${motivo}`);
    cond.push(sql`(${unisci(sql, campi, "or")})`);
  }

  for (const [nome, valori] of Object.entries(filtri.liste)) {
    if (nome !== escludi && valori.length) {
      cond.push(sql`t.${sql(nome)} in ${sql(valori)}`);
    }
  }

  if (filtri.per === "entangled") cond.push(sql`t.per_persona is null`);
  else if (filtri.per) cond.push(sql`t.per_persona = ${filtri.per}`);

  if (filtri.votoMinimo) {
    cond.push(sql`t.${sql(f.votoMinimo)} >= ${filtri.votoMinimo}`);
  }

  if (f.periodo && filtri.periodo !== "tutto") {
    cond.push(
      sql`t.${sql(f.periodo)} >= current_date - ${Number(filtri.periodo)}::int`
    );
  }

  return cond.length ? unisci(sql, cond, "and") : sql`true`;
}

// Colonne aggiuntive: i valori delle tabelle ponte come array
function colonneMulti(sql, s) {
  return s.campi
    .filter((c) => c.tipo === "multi")
    .map(
      (c) => sql`,
        coalesce((
          select array_agg(p.${sql(c.ponte.valore)} order by p.${sql(c.ponte.valore)})
          from ${sql(c.ponte.tabella)} p
          where p.${sql(c.ponte.chiave)} = t.id
        ), '{}') as ${sql(c.nome)}`
    );
}

// ---------------------------------------------------------
// LETTURA
// ---------------------------------------------------------

export async function elenco(chiave, searchParams = {}) {
  await verificaAccesso();
  const s = sezione(chiave);
  const R = await riferimenti();
  const sql = db();
  const filtri = leggiFiltri(s, searchParams, R);
  const tabella = sql(s.tabella);

  const multi = colonneMulti(sql, s);
  const extra = multi.length ? unisci(sql, multi, "") : sql``;

  // ordinamenti: costanti della configurazione, mai input dell'utente
  const ordine = sql.unsafe(s.ordinamenti[filtri.ordina][1]);

  const righe = await sql`
    select t.* ${extra}
    from ${tabella} t
    where ${condizioni(sql, s, filtri)}
    order by ${ordine}
    limit 500
  `;

  // Faccette: quante voci per ogni valore, con gli altri filtri attivi
  const faccette = {};
  for (const nome of s.filtri?.faccette ?? []) {
    const conteggi = await sql`
      select t.${sql(nome)} as valore, count(*)::int as n
      from ${tabella} t
      where ${condizioni(sql, s, filtri, nome)}
      group by 1
    `;
    faccette[nome] = Object.fromEntries(conteggi.map((r) => [String(r.valore), r.n]));
  }

  return { righe, faccette, filtri };
}

// ---------------------------------------------------------
// SCRITTURA
// ---------------------------------------------------------

async function scriviPonti(tx, s, id, multi) {
  for (const c of s.campi.filter((c) => c.tipo === "multi")) {
    const { tabella, chiave, valore } = c.ponte;
    await tx`delete from ${tx(tabella)} where ${tx(chiave)} = ${id}`;
    const righe = (multi[c.nome] ?? []).map((v) => ({ [chiave]: id, [valore]: v }));
    if (righe.length) await tx`insert into ${tx(tabella)} ${tx(righe)}`;
  }
}

// I campi autore prendono la persona collegata
const autori = (s, io) =>
  Object.fromEntries(s.campi.filter((c) => c.automatico).map((c) => [c.nome, io]));

// Se la sezione è "solo autore", la condizione limita alle righe proprie
const soloMie = (sql, s, io) =>
  s.soloAutore ? sql`and ${sql(s.soloAutore)} = ${io}` : sql``;

export async function crea(chiave, formData) {
  const io = await verificaAccesso();
  const s = sezione(chiave);
  const letti = leggiCampi(s, formData, await riferimenti());
  const colonne = { ...letti.colonne, ...autori(s, io) };
  const { multi } = letti;

  await db().begin(async (tx) => {
    const [riga] = await tx`
      insert into ${tx(s.tabella)} ${tx(colonne, Object.keys(colonne))}
      returning id
    `;
    await scriviPonti(tx, s, riga.id, multi);
  });
}

export async function aggiorna(chiave, id, formData) {
  const io = await verificaAccesso();
  const s = sezione(chiave);
  const n = identificativo(id);
  // l'autore non cambia in modifica
  const { colonne, multi } = leggiCampi(s, formData, await riferimenti());
  const valori = { ...colonne, modificato_il: new Date() };

  await db().begin(async (tx) => {
    const aggiornate = await tx`
      update ${tx(s.tabella)}
      set ${tx(valori, Object.keys(valori))}
      where id = ${n} ${soloMie(tx, s, io)}
    `;
    if (aggiornate.count === 1) await scriviPonti(tx, s, n, multi);
  });
}

export async function elimina(chiave, id) {
  const io = await verificaAccesso();
  const s = sezione(chiave);
  const sql = db();
  // le tabelle ponte si svuotano da sole (on delete cascade)
  await sql`
    delete from ${sql(s.tabella)}
    where id = ${identificativo(id)} ${soloMie(sql, s, io)}
  `;
}

// ---------------------------------------------------------
// SINGOLARITÀ: messaggi e parametri vitali
// ---------------------------------------------------------

export async function ultimiMessaggi(limite = 80) {
  await verificaAccesso();
  const sql = db();
  const righe = await sql`
    select id, mittente, testo, inviato_il
    from messaggi
    order by inviato_il desc, id desc
    limit ${limite}
  `;
  return righe.reverse();
}

export async function inviaMessaggio(testo) {
  const io = await verificaAccesso();

  const pulito = String(testo ?? "").trim().slice(0, 2000);
  if (!pulito) return;

  const sql = db();
  await sql`insert into messaggi (mittente, testo) values (${io}, ${pulito})`;
}

export async function ritiraMessaggio(id) {
  const io = await verificaAccesso();
  const sql = db();
  // si possono ritirare solo i propri messaggi
  await sql`
    delete from messaggi
    where id = ${identificativo(id)} and mittente = ${io}
  `;
}

export async function ultimeRilevazioni() {
  await verificaAccesso();
  const sql = db();
  return sql`
    select distinct on (persona) persona, giorno, umore, energia, stress,
           benessere_fisico, sonno_ore
    from rilevazioni
    order by persona, giorno desc, creato_il desc
  `;
}

// ---------------------------------------------------------
// CONTATORE DELLE PAROLE DEL CANCELLO
// ---------------------------------------------------------

export async function statisticheParole() {
  await verificaAccesso();
  const sql = db();

  const top = (giorni) => sql`
    select parola, count(*)::int as volte
    from parole_accesso
    where riuscita
      and (${giorni}::int is null or usata_il >= now() - make_interval(days => ${giorni}::int))
    group by parola
    order by volte desc, max(usata_il) desc
    limit 5
  `;

  const [settimana, mese, sempre, totali, ultime] = await Promise.all([
    top(7),
    top(30),
    top(null),
    sql`
      select persona,
             count(*) filter (where riuscita)::int as riusciti,
             count(*) filter (where not riuscita)::int as falliti,
             count(distinct parola) filter (where riuscita)::int as parole_diverse
      from parole_accesso
      where usata_il >= now() - interval '30 days'
      group by persona
    `,
    sql`
      select parola, persona, usata_il
      from parole_accesso
      where riuscita
      order by usata_il desc
      limit 5
    `,
  ]);

  return { settimana, mese, sempre, totali, ultime };
}
