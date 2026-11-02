import { Suspense } from "react";
import { verificaAccesso } from "../lib/sessione";
import MappaStellare from "../MappaStellare";
import { VOCI_MAPPA } from "../lib/mappa";
import Singolarita from "../Singolarita";

export const metadata = { title: "Singolarità" };

// Leggere i cookie è "dinamico": con Cache Components va dentro Suspense
async function Contenuto() {
  // Senza identificazione e senza la rima giusta si torna all'ingresso
  await verificaAccesso();

  return (
    <>
    <section className="hero">
      <p
        className="riga-accesso"
        aria-label="Connessione stabilita"
      >
        <span className="terminale" aria-hidden="true">
          <span className="ok"></span>
          <span className="digita" style={{ "--n": 21 }}>
            connessione stabilita
          </span>
        </span>
      </p>
      <h1 className="titolo titolo-riga">
        Oltre l'orizzonte degli eventi
      </h1>
      <p className="sottotitolo">
        <br />
      lo spaziotempo assume una geometria estrema.
      Ogni traiettoria causale converge verso la singolarità, e l'esterno non può ricevere alcun segnale da questa regione.
      
      Qui, ogni traiettoria converge verso di noi.
      </p>

      <MappaStellare voci={VOCI_MAPPA} />
    </section>

    <Singolarita />
    </>
  );
}

export default function Welcome() {
  return (
    <main>
      <Suspense
        fallback={
          <p className="terminale">
            <span className="prompt">&gt;</span> verifica_accesso
            <span className="cursore" />
          </p>
        }
      >
        <Contenuto />
      </Suspense>
    </main>
  );
}