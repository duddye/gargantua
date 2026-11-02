import Link from "next/link";
import ModuloFiltri from "./ModuloFiltri";
import { campo, opzioniDi, PERIODI, filtriAttivi } from "../lib/sezioni";

// Pannello filtri generato dalla configurazione della sezione:
// ricerca · liste (caselle con conteggi) · per chi · voto · periodo · ordine
export default function Filtri({ s, R, filtri, faccette, totale }) {
  const f = s.filtri ?? {};
  const attivi = filtriAttivi(filtri);

  return (
    <ModuloFiltri azione={s.percorso}>
      {f.ricerca && (
        <div className="filtro-riga">
          <input
            type="search"
            name="q"
            defaultValue={filtri.q}
            placeholder="Cerca nel cielo…"
            aria-label="Cerca"
            className="filtro-ricerca"
          />
          <button type="submit" className="bottone bottone-piccolo">
            Scansiona
          </button>
        </div>
      )}

      {(f.liste ?? []).map((nome) => {
        const c = campo(s, nome);
        const conteggi = faccette[nome];
        return (
          <fieldset key={nome} className="filtro-gruppo">
            <legend>{c.etichetta}</legend>
            <div className="scala">
              {opzioniDi(c, R).map((o) => {
                const n = conteggi?.[o.valore] ?? 0;
                const scelto = filtri.liste[nome].includes(o.valore);
                if (conteggi && n === 0 && !scelto) return null;
                return (
                  <label key={o.valore} className="pillola">
                    <input
                      type="checkbox"
                      name={nome}
                      value={o.valore}
                      defaultChecked={scelto}
                    />
                    <span>
                      {o.simbolo && <span aria-hidden="true">{o.simbolo} </span>}
                      {o.etichetta}
                      {conteggi && <span className="conteggio">{n}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {f.orbita && (
        <fieldset className="filtro-gruppo">
          <legend>Per chi</legend>
          <div className="scala">
            {[
              { valore: "", etichetta: "Tutto l'universo" },
              { valore: "entangled", etichetta: "Entangled" },
              ...R.persone.map((p) => ({
                valore: p.valore,
                etichetta: `Orbita di ${p.etichetta}`,
              })),
            ].map((o) => (
              <label key={o.valore || "tutto"} className="pillola">
                <input
                  type="radio"
                  name="per"
                  value={o.valore}
                  defaultChecked={filtri.per === o.valore}
                />
                <span>{o.etichetta}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="filtro-riga filtro-menu">
        {f.votoMinimo && (
          <label>
            <span>Luminosità minima</span>
            <select name="voto_min" defaultValue={filtri.votoMinimo ?? ""}>
              <option value="">Qualsiasi</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} o più
                </option>
              ))}
            </select>
          </label>
        )}

        {f.periodo && (
          <label>
            <span>Periodo</span>
            <select name="periodo" defaultValue={filtri.periodo}>
              {PERIODI.map((p) => (
                <option key={p.valore} value={p.valore}>
                  {p.etichetta}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span>Ordina</span>
          <select name="ordina" defaultValue={filtri.ordina}>
            {Object.entries(s.ordinamenti).map(([chiave, [etichetta]]) => (
              <option key={chiave} value={chiave}>
                {etichetta}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="filtro-esito" aria-live="polite">
        <span>
          {totale} {totale === 1 ? "voce" : "voci"}
          {attivi ? " trovate" : ""}
        </span>
        {attivi && (
          <Link href={s.percorso} scroll={false}>
            Azzera i filtri
          </Link>
        )}
      </p>
    </ModuloFiltri>
  );
}
