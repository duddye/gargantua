"use client";

// Se qualcosa va storto (database irraggiungibile, dato non valido…)
export default function Anomalia({ error, retry }) {
  return (
    <section className="sezione-diario anomalia" role="alert">
      <header className="intestazione-sezione">
        <span className="intestazione-simbolo" aria-hidden="true">⚠</span>
        <h1>Anomalia gravitazionale</h1>
        <p>Il segnale si è perso da qualche parte nello spaziotempo.</p>
      </header>

      <p className="terminale">
        <span className="prompt">&gt;</span>{" "}
        {error?.digest ? `errore_${error.digest}` : "errore_sconosciuto"}
      </p>

      <button type="button" className="bottone" onClick={() => retry?.()}>
        Riprova la trasmissione
      </button>
    </section>
  );
}
