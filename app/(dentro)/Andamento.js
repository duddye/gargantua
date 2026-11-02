import { oggiRoma } from "../lib/sezioni";

// Telemetria: per ogni persona una striscia di giorni colorata
// dall'umore, più le medie del periodo.

const media = (valori) => {
  const v = valori.filter((x) => x != null).map(Number);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

const fmt = (n, cifre = 1) =>
  n == null ? "—" : n.toFixed(cifre).replace(".", ",");

function giorniIndietro(oggi, quanti) {
  const base = new Date(`${oggi}T00:00:00Z`);
  return Array.from({ length: quanti }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - (quanti - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function Andamento({ righe, R, filtri }) {
  if (righe.length === 0) return null;

  const quanti = filtri.periodo === "tutto" ? 90 : Math.min(Number(filtri.periodo), 90);
  const giorni = giorniIndietro(oggiRoma(), quanti);
  const persone = R.persone.filter((p) => righe.some((r) => r.persona === p.valore));
  const nomeUmore = (v) => R.livelli_umore.find((u) => u.valore === String(v))?.etichetta;

  return (
    <section className="andamento" aria-label="Andamento dell'umore">
      {persone.map((p) => {
        const sue = righe.filter((r) => r.persona === p.valore);
        const perGiorno = new Map();
        for (const r of sue) {
          perGiorno.set(r.giorno, [...(perGiorno.get(r.giorno) ?? []), r.umore]);
        }
        const umoreMedio = media(sue.map((r) => r.umore));

        return (
          <div key={p.valore} className="andamento-persona">
            <h3>{p.etichetta}</h3>

            <ol className="striscia" style={{ "--giorni": quanti }}>
              {giorni.map((g) => {
                const u = media(perGiorno.get(g) ?? []);
                return (
                  <li
                    key={g}
                    data-livello={u == null ? undefined : Math.round(u)}
                    title={u == null ? `${g}: nessuna rilevazione` : `${g}: ${nomeUmore(Math.round(u))}`}
                  />
                );
              })}
            </ol>

            <dl className="medie">
              <div>
                <dt>Umore</dt>
                <dd>{umoreMedio == null ? "—" : nomeUmore(Math.round(umoreMedio))}</dd>
              </div>
              <div>
                <dt>Energia</dt>
                <dd>{fmt(media(sue.map((r) => r.energia)))}/5</dd>
              </div>
              <div>
                <dt>Stress</dt>
                <dd>{fmt(media(sue.map((r) => r.stress)))}/5</dd>
              </div>
              <div>
                <dt>Corpo</dt>
                <dd>{fmt(media(sue.map((r) => r.benessere_fisico)))}/5</dd>
              </div>
              <div>
                <dt>Sonno</dt>
                <dd>{fmt(media(sue.map((r) => r.sonno_ore)))} h</dd>
              </div>
            </dl>
          </div>
        );
      })}
      <p className="andamento-legenda">
        Ogni quadratino è un giorno: dal buio (buco nero) all&apos;oro (supernova).
      </p>
    </section>
  );
}
