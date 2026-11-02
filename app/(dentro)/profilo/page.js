import { Suspense } from "react";
import CambiaChiave from "./CambiaChiave";
import { esci } from "../azioni";
import { leggiIo, riferimenti, nomePersona } from "../../lib/riferimenti";

export const metadata = { title: "Profilo" };

async function Contenuto() {
  const [io, R] = await Promise.all([leggiIo(), riferimenti()]);

  return (
    <>
      <p className="profilo-chi">
        Collegato come <strong>{nomePersona(R, io)}</strong>
      </p>

      <section className="pannello profilo-pannello">
        <h2 className="plancia-titolo">Chiave personale</h2>
        <CambiaChiave />
      </section>

      <form action={esci} className="profilo-esci">
        <button type="submit" className="bottone bottone-pericolo">
          Esci dall&apos;orbita
        </button>
      </form>
    </>
  );
}

export default function Profilo() {
  return (
    <section className="sezione-diario">
      <header className="intestazione-sezione">
        <span className="intestazione-simbolo" aria-hidden="true">◍</span>
        <h1>Profilo</h1>
        <p>Coordinate personali</p>
      </header>

      <Suspense
        fallback={
          <p className="terminale ricezione">
            <span className="prompt">&gt;</span> lettura_coordinate
            <span className="cursore" />
          </p>
        }
      >
        <Contenuto />
      </Suspense>
    </section>
  );
}
