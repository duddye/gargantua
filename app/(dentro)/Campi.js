import { opzioniDi, predefinito } from "../lib/sezioni";

// I controlli di un modulo, generati dalla configurazione della sezione.
// Con `valori` diventa il modulo di modifica (precompilato).
// `prefisso` rende unici i nomi dei gruppi radio tra più moduli.

export default function Campi({ campi, R, valori, prefisso = "nuovo" }) {
  return (
    <div className="campi">
      {campi.filter((c) => !c.automatico).map((c) => {
        const attuale = valori ? valori[c.nome] : predefinito(c);
        const largo =
          c.tipo === "area" ||
          c.tipo === "multi" ||
          c.ruolo === "titolo" ||
          (c.tipo === "scala" && c.fonte);

        const contenuto = (
          <Controllo
            campo={c}
            opzioni={opzioniDi(c, R)}
            valore={attuale}
            id={`${prefisso}-${c.nome}`}
          />
        );

        // Scale e caselle sono gruppi: fieldset + legend
        if (c.tipo === "scala" || c.tipo === "multi") {
          return (
            <fieldset key={c.nome} className={`campo${largo ? " campo-largo" : ""}`}>
              <legend className="campo-etichetta">
                {c.etichetta}
                {c.obbligatorio && <span aria-hidden="true"> *</span>}
              </legend>
              {contenuto}
            </fieldset>
          );
        }

        return (
          <label key={c.nome} className={`campo${largo ? " campo-largo" : ""}`}>
            <span className="campo-etichetta">
              {c.etichetta}
              {c.obbligatorio && <span aria-hidden="true"> *</span>}
            </span>
            {contenuto}
          </label>
        );
      })}
    </div>
  );
}

function Controllo({ campo: c, opzioni, valore, id }) {
  const testo = valore == null ? "" : String(valore);

  switch (c.tipo) {
    case "area":
      return (
        <textarea
          name={c.nome}
          defaultValue={testo}
          required={c.obbligatorio}
          rows={4}
          maxLength={c.max}
          placeholder={c.segnaposto}
        />
      );

    case "numero":
      return (
        <input
          name={c.nome}
          defaultValue={testo}
          required={c.obbligatorio}
          type="number"
          inputMode="decimal"
          min={c.min}
          max={c.max}
          step={c.passo ?? 1}
        />
      );

    case "data":
      return (
        <input name={c.nome} defaultValue={testo} required={c.obbligatorio} type="date" />
      );

    case "scelta":
      return (
        <select name={c.nome} defaultValue={testo} required={c.obbligatorio}>
          {c.obbligatorio ? (
            !testo && (
              <option value="" disabled>
                Scegli…
              </option>
            )
          ) : (
            <option value="">{c.vuoto ?? "—"}</option>
          )}
          {opzioni.map((o) => (
            <option key={o.valore} value={o.valore}>
              {o.simbolo ? `${o.simbolo}  ${o.etichetta}` : o.etichetta}
            </option>
          ))}
        </select>
      );

    case "scala":
      return (
        <div className="scala">
          {c.estremi && <span className="scala-estremo">{c.estremi[0]}</span>}
          {!c.obbligatorio && (
            <label className="pillola pillola-vuota" title="Non indicato">
              <input type="radio" name={c.nome} value="" defaultChecked={!testo} />
              <span>—</span>
            </label>
          )}
          {opzioni.map((o) => (
            <label key={o.valore} className="pillola" data-livello={o.valore}>
              <input
                type="radio"
                name={c.nome}
                value={o.valore}
                defaultChecked={testo === o.valore}
                required={c.obbligatorio}
                id={`${id}-${o.valore}`}
              />
              <span>{o.etichetta}</span>
            </label>
          ))}
          {c.estremi && <span className="scala-estremo">{c.estremi[1]}</span>}
        </div>
      );

    case "multi": {
      const scelti = new Set(Array.isArray(valore) ? valore : []);
      return (
        <div className="scala scala-multi">
          {opzioni.map((o) => (
            <label key={o.valore} className="pillola">
              <input
                type="checkbox"
                name={c.nome}
                value={o.valore}
                defaultChecked={scelti.has(o.valore)}
              />
              <span>{o.etichetta}</span>
            </label>
          ))}
        </div>
      );
    }

    default:
      return (
        <input
          name={c.nome}
          defaultValue={testo}
          required={c.obbligatorio}
          type="text"
          maxLength={c.max}
          placeholder={c.segnaposto}
          autoComplete="off"
        />
      );
  }
}
