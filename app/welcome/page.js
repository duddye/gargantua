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