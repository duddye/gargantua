import { Suspense } from "react";
import Cancello from "./Cancello";
import Identificazione from "./Identificazione";
import { personaCollegata } from "./lib/sessione";
import { db } from "./lib/db";

// Ingresso in due passi:
//  1. Identificazione (persona + chiave)
//  2. Cancello della rima con Orione
async function Ingresso() {
  const persona = await personaCollegata();
  if (persona) return <Cancello />;

  const sql = db();
  const persone = await sql`select codice, nome from persone order by nome`;
  return <Identificazione persone={persone.map((p) => ({ ...p }))} />;
}

export default function Home() {
  return (
    <main>
      <Suspense
        fallback={
          <p className="terminale ricezione-ingresso">
            <span className="prompt">&gt;</span> allineamento
            <span className="cursore" />
          </p>
        }
      >
        <Ingresso />
      </Suspense>
    </main>
  );
}
