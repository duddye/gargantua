"use client";

import { useActionState } from "react";
import { accedi } from "./actions";

// Primo passo: chi sei + la tua chiave. Poi arriva il cancello della rima.
// Come al cancello, l'errore è solo visivo (il bagliore arrossisce);
// agli screen reader arriva comunque un messaggio.

const MESSAGGI = {
  chiave: "Chiave errata.",
  persona: "Scegli chi sei.",
  senza_chiave: "Nessuna chiave impostata per questa persona.",
};

export default function Identificazione({ persone }) {
  const [stato, azione, inAttesa] = useActionState(accedi, null);

  return (
    <form
      action={azione}
      className="identificazione"
      data-errore={stato?.errore ? (stato.tentativo % 2 ? "a" : "b") : undefined}
    >
      <p className="terminale">
        <span className="prompt">&gt;</span> identificazione_richiesta
        <span className="cursore" />
      </p>

      <fieldset className="chi-sei">
        <legend className="istruzione">Chi si avvicina alla singolarità?</legend>
        <div className="chi-sei-scelte">
          {persone.map((p, i) => (
            <label key={p.codice} className="chi-sei-persona">
              <input
                type="radio"
                name="persona"
                value={p.codice}
                required
                defaultChecked={i === 0}
              />
              <span>{p.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="chiave">
        <span className="istruzione">Chiave</span>
        <input
          type="password"
          name="chiave"
          autoComplete="current-password"
          maxLength={200}
          autoFocus
          disabled={inAttesa}
        />
      </label>

      <button type="submit" className="bottone" disabled={inAttesa}>
        {inAttesa ? "Allineamento…" : "Attracca"}
      </button>

      <p className="solo-lettori" role="status">
        {stato?.errore ? MESSAGGI[stato.errore] : ""}
      </p>

      {stato?.errore === "senza_chiave" && (
        <p className="identificazione-nota">
          Impostala dal terminale: <code>npm run chiave -- nome</code>
        </p>
      )}
    </form>
  );
}
