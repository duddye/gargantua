"use client";

import { useActionState } from "react";
import { cambiaChiave } from "../azioni";

export default function CambiaChiave() {
  const [stato, azione, inAttesa] = useActionState(cambiaChiave, null);

  return (
    <form action={azione} className="modulo-voce">
      <div className="campi">
        <label className="campo campo-largo">
          <span className="campo-etichetta">Chiave attuale</span>
          <input type="password" name="attuale" required autoComplete="current-password" maxLength={200} />
        </label>
        <label className="campo">
          <span className="campo-etichetta">Nuova chiave</span>
          <input type="password" name="nuova" required minLength={6} maxLength={200} autoComplete="new-password" />
        </label>
        <label className="campo">
          <span className="campo-etichetta">Ripeti la nuova chiave</span>
          <input type="password" name="conferma" required minLength={6} maxLength={200} autoComplete="new-password" />
        </label>
      </div>

      <button type="submit" className="bottone" disabled={inAttesa}>
        {inAttesa ? "Ricalibrazione…" : "Cambia chiave"}
      </button>

      <p className={`esito ${stato?.ok ? "esito-ok" : "esito-errore"}`} role="status">
        {stato?.ok ? "Chiave aggiornata." : (stato?.errore ?? "")}
      </p>
    </form>
  );
}
