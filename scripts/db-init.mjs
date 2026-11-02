// Applica db/schema.sql al database indicato da DATABASE_URL.
// Uso: npm run db:init   (legge .env.local)

import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Manca DATABASE_URL (in .env.local o nell'ambiente).");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
  await sql.unsafe(schema);
  const tabelle = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' order by table_name`;
  console.log("Schema applicato. Tabelle:", tabelle.map((t) => t.table_name).join(", "));
} finally {
  await sql.end();
}
