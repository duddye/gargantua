import Link from "next/link";

import CampoMessaggio from "./CampoMessaggio";
import Sintonizzatore from "./Sintonizzatore";
import { inviaMessaggio, ritiraMessaggio } from "./(dentro)/azioni";
import { ultimiMessaggi, ultimeRilevazioni, statisticheParole } from "./lib/dati";
import { riferimenti, leggiIo, nomePersona } from "./lib/riferimenti";
import { oggiRoma } from "./lib/sezioni";

// =========================================================
// SINGOLARITÀ: parametri vitali · messaggini · statistiche del cancello
// =========================================================

export default async function Singolarita() {
  const [R, io, messaggi, vitali, parole] = await Promise.all([
    riferimenti(),
    leggiIo(),
    ultimiMessaggi(),
    ultimeRilevazioni(),
    statisticheParole(),
  ]);

  return (
    <section className="plancia" aria-label="Singolarità">
      <Sintonizzatore ogniSecondi={8} />

      <Vitali R={R} vitali={vitali} />

      <Chat R={R} io={io} messaggi={messaggi} />

      <Statistiche R={R} parole={parole} />
    </section>
  );
}

// ---------------------------------------------------------

const formatoGiorno = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function Vitali({ R, vitali }) {
  const oggi = oggiRoma();
  const umore = (v) => R.livelli_umore.find((u) => u.valore === String(v));

  return (
    <div className="vitali">
      <h2 className="plancia-titolo">Parametri vitali</h2>
      <ul>
        {R.persone.map((p) => {
          const v = vitali.find((x) => x.persona === p.valore);
          return (
            <li key={p.valore} data-livello={v?.umore}>
              <span className="vitali-nome">{p.etichetta}</span>
              {v ? (
                <>
                  <span className="vitali-umore">{umore(v.umore)?.etichetta}</span>
                  <span className="vitali-quando">
                    {v.giorno === oggi ? "oggi" : formatoGiorno.format(new Date(`${v.giorno}T00:00:00Z`))}
                  </span>
                </>
              ) : (
                <span className="vitali-quando">nessuna rilevazione</span>
              )}
            </li>
          );
        })}
      </ul>
      <Link href="/telemetria" className="vitali-link">
        Registra o vedi la telemetria →
      </Link>
    </div>
  );
}

// ---------------------------------------------------------

const formatoOra = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

const formatoDataChat = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Rome",
});

const giornoRoma = (d) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(d);

function Chat({ R, io, messaggi }) {
  const oggi = oggiRoma();

  return (
    <div className="chat">
      <h2 className="plancia-titolo">Canale entangled</h2>

      {/* column-reverse: la chat parte già scrollata in fondo */}
      <div className="chat-flusso" tabIndex={0} aria-label="Messaggi">
        <ol>
          {messaggi.length === 0 && (
            <li className="chat-vuota">Nessun segnale ancora. Rompi il silenzio.</li>
          )}
          {messaggi.map((m, i) => {
            const giorno = giornoRoma(m.inviato_il);
            const nuovoGiorno = i === 0 || giornoRoma(messaggi[i - 1].inviato_il) !== giorno;
            const mio = m.mittente === io;
            return (
              <li key={m.id} className="chat-riga">
                {nuovoGiorno && (
                  <p className="chat-giorno">
                    {giorno === oggi ? "Oggi" : formatoDataChat.format(m.inviato_il)}
                  </p>
                )}
                <div className={`bolla ${mio ? "bolla-mia" : "bolla-altrui"}`}>
                  <span className="bolla-chi">{nomePersona(R, m.mittente)}</span>
                  <p className="bolla-testo">{m.testo}</p>
                  <span className="bolla-meta">
                    <time dateTime={m.inviato_il.toISOString()}>
                      {formatoOra.format(m.inviato_il)}
                    </time>
                    {mio && (
                      <form action={ritiraMessaggio.bind(null, String(m.id))}>
                        <button type="submit" className="bolla-ritira" title="Ritira il messaggio">
                          ritira
                        </button>
                      </form>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <form action={inviaMessaggio} className="chat-invio">
        <CampoMessaggio />
        <button type="submit" className="bottone">
          Trasmetti
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------
// STATISTICHE DEL CANCELLO: le rime con Orione più usate
// ---------------------------------------------------------

function Classifica({ titolo, righe }) {
  const massimo = righe[0]?.volte ?? 1;
  return (
    <div className="classifica">
      <h3>{titolo}</h3>
      {righe.length === 0 ? (
        <p className="classifica-vuota">Nessuna rima registrata.</p>
      ) : (
        <ol>
          {righe.map((r) => (
            <li key={r.parola} style={{ "--quota": r.volte / massimo }}>
              <span className="classifica-parola">{r.parola}</span>
              <span className="classifica-volte">{r.volte}×</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Statistiche({ R, parole }) {
  return (
    <div className="statistiche">
      <h2 className="plancia-titolo">Spettro delle rime</h2>
      <p className="statistiche-sotto">Le parole più usate per attraversare il cancello</p>

      <div className="classifiche">
        <Classifica titolo="Questa settimana" righe={parole.settimana} />
        <Classifica titolo="Questo mese" righe={parole.mese} />
        <Classifica titolo="Da sempre" righe={parole.sempre} />
      </div>

      <dl className="medie statistiche-persone">
        {R.persone.map((p) => {
          const t = parole.totali.find((x) => x.persona === p.valore);
          return (
            <div key={p.valore}>
              <dt>{p.etichetta} · ultimi 30 giorni</dt>
              <dd>
                {t?.riusciti ?? 0} accessi · {t?.parole_diverse ?? 0} rime diverse ·{" "}
                {t?.falliti ?? 0} tentativi a vuoto
              </dd>
            </div>
          );
        })}
      </dl>

      {parole.ultime.length > 0 && (
        <p className="statistiche-ultime">
          Ultime rime:{" "}
          {parole.ultime.map((u, i) => (
            <span key={i}>
              {i > 0 && " · "}
              <strong>{u.parola}</strong> ({nomePersona(R, u.persona)})
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
