import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { tokenAccesso } from "../lib/accesso";

export const metadata = { title: "Welcome" };

// Leggere i cookie è "dinamico": con Cache Components va dentro Suspense
async function Contenuto() {
  const biscotti = await cookies();

  // Senza la parola giusta si torna al cancello
  if (biscotti.get("accesso")?.value !== tokenAccesso()) {
    redirect("/");
  }

  return (
    <section className="hero benvenuto">
      <p className="riga-accesso" aria-label="Connessione stabilita">
        <span className="terminale" aria-hidden="true">
          <span className="ok"></span>
          <span className="digita" style={{ "--n": 21 }}>
            connessione stabilita
          </span>
        </span>
      </p>

      {/* Orizzonte degli eventi: anello di luce attorno al buio */}
      <div className="orizzonte" aria-hidden="true" />

      <h1 className="titolo titolo-riga">
        Oltre l&apos;orizzonte degli eventi
      </h1>

      <div className="testo-benvenuto">
        <p className="prosa comparsa" style={{ "--r": "2s" }}>
          lo spaziotempo assume una geometria estrema. Ogni traiettoria
          causale converge verso la singolarità, e l&apos;esterno non può
          ricevere alcun segnale da questa regione.
        </p>

        <p
          className="separatore comparsa"
          style={{ "--r": "2.6s" }}
          aria-hidden="true"
        >
          {"//"}
        </p>

        <p className="approdo comparsa" style={{ "--r": "3s" }}>
          Qui, ogni traiettoria converge verso di noi.
        </p>
      </div>
    </section>
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