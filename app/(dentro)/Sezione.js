import { Suspense } from "react";

import Campi from "./Campi";
import Filtri from "./Filtri";
import Andamento from "./Andamento";
import { creaVoce, aggiornaVoce, eliminaVoce } from "./azioni";
import { elenco } from "../lib/dati";
import { riferimenti, leggiIo, nomeOrbita } from "../lib/riferimenti";
import { SEZIONI, opzioniDi } from "../lib/sezioni";

// =========================================================
// UNA SEZIONE DEL DIARIO
// intestazione · modulo per aggiungere · filtri · elenco
// =========================================================

export default function Sezione({ chiave, searchParams }) {
  const s = SEZIONI[chiave];

  return (
    <section className="sezione-diario">
      <header className="intestazione-sezione">
        <span className="intestazione-simbolo" aria-hidden="true">
          {s.simbolo}
        </span>
        <h1>{s.titolo}</h1>
        <p>{s.sottotitolo}</p>
      </header>

      <Suspense
        fallback={
          <p className="terminale ricezione">
            <span className="prompt">&gt;</span> ricezione_segnale
            <span className="cursore" />
          </p>
        }
      >
        <Contenuto chiave={chiave} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Contenuto({ chiave, searchParams }) {
  const s = SEZIONI[chiave];
  const sp = (await searchParams) ?? {};
  const [R, io, { righe, faccette, filtri }] = await Promise.all([
    riferimenti(),
    leggiIo(),
    elenco(chiave, sp),
  ]);

  return (
    <>
      <details className="pannello nuova-voce">
        <summary>{s.nuovo}</summary>
        <form action={creaVoce.bind(null, chiave)} className="modulo-voce">
          <Campi campi={s.campi} R={R} />
          <button type="submit" className="bottone">
            {s.invia}
          </button>
        </form>
      </details>

      <Filtri
        s={s}
        R={R}
        filtri={filtri}
        faccette={faccette}
        totale={righe.length}
      />

      {s.andamento && <Andamento righe={righe} R={R} filtri={filtri} />}

      {righe.length === 0 ? (
        <p className="vuoto-cosmico">{s.vuoto}</p>
      ) : (
        <ol className="elenco-voci">
          {righe.map((r) => (
            <li key={r.id}>
              <Voce chiave={chiave} s={s} riga={r} R={R} io={io} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

// ---------------------------------------------------------

const formatoData = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Rome",
});

const formatoGiorno = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function mostraValore(c, valore, R) {
  if (c.tipo === "data") return formatoGiorno.format(new Date(`${valore}T00:00:00Z`));
  if (c.tipo === "multi") return null;
  if (c.tipo === "scelta" || c.tipo === "scala") {
    const o = opzioniDi({ ...c, formato: undefined }, R).find(
      (o) => o.valore === String(valore)
    );
    if (!o) return String(valore);
    return o.simbolo ? `${o.simbolo} ${o.etichetta}` : o.etichetta;
  }
  if (c.passo) return String(Number(valore)).replace(".", ",");
  return String(valore);
}

function Voce({ chiave, s, riga, R, io }) {
  const titolo = s.campi.find((c) => c.ruolo === "titolo");
  const corpo = s.campi.find((c) => c.ruolo === "corpo");
  const intestazione = s.campi.filter((c) => c.ruolo === "intestazione");
  const haOrbita = s.campi.some((c) => c.nome === "per_persona");
  const etichette = s.campi.filter(
    (c) =>
      !c.ruolo &&
      c.nome !== "per_persona" &&
      riga[c.nome] != null &&
      !(c.tipo === "multi" && riga[c.nome].length === 0)
  );
  const id = String(riga.id);
  const modificabile = !s.soloAutore || riga[s.soloAutore] === io;

  return (
    <article
      className="voce-diario"
      data-orbita={haOrbita ? (riga.per_persona ?? "entangled") : undefined}
      data-stato={riga.stato ?? undefined}
      data-umore={riga.umore ?? undefined}
    >
      <p className="voce-intestazione">
        {intestazione.map((c) => (
          <span key={c.nome} data-campo={c.nome}>
            {mostraValore(c, riga[c.nome], R)}
          </span>
        ))}
        {haOrbita && (
          <span className={`orbita ${riga.per_persona ? "orbita-sola" : "orbita-entangled"}`}>
            {nomeOrbita(R, riga.per_persona)}
          </span>
        )}
      </p>

      {titolo && (
        <h2 className="voce-titolo">{mostraValore(titolo, riga[titolo.nome], R)}</h2>
      )}

      {corpo && riga[corpo.nome] && <p className="voce-corpo">{riga[corpo.nome]}</p>}

      {etichette.length > 0 && (
        <ul className="voce-etichette">
          {etichette.map((c) =>
            c.tipo === "multi" ? (
              riga[c.nome].map((v) => (
                <li key={`${c.nome}-${v}`} className="etichetta-multi">
                  {opzioniDi(c, R).find((o) => o.valore === v)?.etichetta ?? v}
                </li>
              ))
            ) : (
              <li key={c.nome} data-campo={c.nome}>
                <span className="etichetta-nome">{c.etichetta}</span>{" "}
                {mostraValore(c, riga[c.nome], R)}
              </li>
            )
          )}
        </ul>
      )}

      <footer className="voce-piede">
        <time dateTime={new Date(riga.creato_il).toISOString()}>
          {formatoData.format(riga.creato_il)}
        </time>
        {riga.modificato_il && <span> · ricalibrato</span>}

        {modificabile && (
        <>
        <details className="azione">
          <summary>Ricalibra</summary>
          <form action={aggiornaVoce.bind(null, chiave, id)} className="modulo-voce">
            <Campi campi={s.campi} R={R} valori={riga} prefisso={`m${id}`} />
            <button type="submit" className="bottone">
              Salva la nuova traiettoria
            </button>
          </form>
        </details>

        <details className="azione azione-pericolo">
          <summary>Disperdi</summary>
          <form action={eliminaVoce.bind(null, chiave, id)}>
            <p>Disperdere questa voce nel vuoto? Non tornerà indietro.</p>
            <button type="submit" className="bottone bottone-pericolo">
              Disperdi nel vuoto
            </button>
          </form>
        </details>
        </>
        )}
      </footer>
    </article>
  );
}
