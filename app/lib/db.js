import "server-only";

import postgres from "postgres";

// Una sola connessione condivisa (anche tra i ricaricamenti in sviluppo).
// prepare: false → compatibile con i pooler tipo Neon/PgBouncer.
export function db() {
  if (!globalThis.__gargantuaSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Manca DATABASE_URL in .env.local");

    globalThis.__gargantuaSql = postgres(url, {
      max: 5,
      prepare: false,
      idle_timeout: 20,
      onnotice: () => {},
      // le date (tipo "date") restano stringhe "AAAA-MM-GG":
      // niente sorprese di fuso orario nei moduli
      types: {
        data: {
          to: 1082,
          from: [1082],
          serialize: (x) => x,
          parse: (x) => x,
        },
      },
    });
  }
  return globalThis.__gargantuaSql;
}
