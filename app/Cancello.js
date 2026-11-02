"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifica } from "./actions";

// =========================================
// STELLE DI ORIONE
// [x, y, raggio, classe CSS]
// =========================================

const stelle = [
  // Clava / braccio sinistro
  [36.0, 15.0, 1.8],                       // 0
  [43.0, 15.5, 1.8],                       // 1
  [32.0, 30.0, 2.0],                       // 2
  [36.0, 42.0, 2.2],                       // 3

  // Stelle principali
  [40.0, 50.0, 3.4, "stella-betelgeuse"],   // 4
  [48.0, 40.0, 2.0, "stella-meissa"],      // 5
  [56.0, 50.0, 2.6, "stella-bellatrix"],   // 6

  // Cintura
  [48.0, 72.0, 2.5, "stella-alnitak"],     // 7
  [51.5, 70.0, 2.6, "stella-alnilam"],     // 8
  [55.0, 66.0, 2.3, "stella-mintaka"],     // 9

  // Piedi
  [44.0, 92.0, 2.4, "stella-saiph"],       // 10
  [61.0, 86.0, 3.2, "stella-rigel"],       // 11

  // Braccio destro / scudo
  [63.0, 38.0, 1.6],                       // 12
  [66.0, 39.0, 1.6],                       // 13
  [69.0, 42.0, 1.6],                       // 14
  [72.0, 46.0, 1.6],                       // 15
  [73.5, 52.0, 1.6],                       // 16
  [72.0, 58.0, 1.6],                       // 17
];

// =========================================
// TRASFORMAZIONE DELLA COSTELLAZIONE
// =========================================

const centroX = 52.75;
const centroY = 53.5;

const fattoreOrizzontale = 1.75;
const fattoreVerticale = 1.15;

const xOrione = (x) =>
  centroX + (x - centroX) * fattoreOrizzontale;

const yOrione = (y) =>
  centroY + (y - centroY) * fattoreVerticale;

// =========================================
// COLLEGAMENTI ORIGINALI
// =========================================

const collegamenti = [
  // Clava / braccio sinistro
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],

  // Testa e spalle
  [4, 5],
  [5, 6],

  // Torso
  [4, 7],
  [6, 9],

  // Cintura
  [7, 8],
  [8, 9],

  // Gambe
  [7, 10],
  [9, 11],

  // Braccio destro / scudo
  [6, 14],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
];

// =========================================
// SEQUENZA DI ACCENSIONE (solo al successo)
// Gli archi si tracciano uno dopo l'altro
// =========================================

const PASSO_ARCO = 0.09; // secondi tra un arco e il successivo
const FINE_TRACCIATO = collegamenti.length * PASSO_ARCO + 0.45;
const ATTESA_ACCESSO = 3600; // ms prima di entrare

// =========================================
// PARAMETRI ANIMAZIONI ORIGINALI
// =========================================

const VARIANTI = ["a", "b", "c"];

const durata = (i) =>
  (7 + ((i * 5) % 7) * 1.3).toFixed(1);

const ritardo = (i) =>
  (0.6 + ((i * 11) % 9) * 0.7).toFixed(1);

// =========================================
// COMPONENTE
// =========================================

export default function Cancello() {
  const [stato, azione, inAttesa] = useActionState(verifica, null);

  const accessoRiuscito = stato?.successo === true;
  const router = useRouter();

  // Dopo l'animazione: si entra
  useEffect(() => {
    if (!accessoRiuscito) return;

    const ridotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = setTimeout(
      () => router.replace("/welcome"),
      ridotto ? 400 : ATTESA_ACCESSO
    );

    return () => clearTimeout(timer);
  }, [accessoRiuscito, router]);

  return (
    <form
      action={azione}
      className="cancello"
      data-success={accessoRiuscito ? "true" : "false"}
      data-errore={
        stato?.errore ? (stato.tentativo % 2 ? "a" : "b") : undefined
      }
      style={{ "--fine-tracciato": `${FINE_TRACCIATO.toFixed(2)}s` }}
    >
      {/* COSTELLAZIONE (+ Cassiopea in un SVG a parte, sovrapposto) */}

      <div className="cielo-orione">
        <svg
          className="costellazione"
          viewBox="10 4 86 98"
          role="img"
          aria-label="La costellazione di Orione"
        >
          <defs>
            <radialGradient id="m42">
              <stop offset="0%" stopColor="#9b72c9" stopOpacity="0.65" />
              <stop offset="45%" stopColor="#63417f" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#291638" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse
            cx="48"
            cy="70"
            rx="5"
            ry="10"
            fill="url(#m42)"
            opacity="0.65"
          />

          {/* Collegamenti originali */}

          {collegamenti.map(([a, b], i) => (
            <line
              key={`originale-${a}-${b}`}
              x1={xOrione(stelle[a][0])}
              y1={yOrione(stelle[a][1])}
              x2={xOrione(stelle[b][0])}
              y2={yOrione(stelle[b][1])}
              pathLength={1}
              data-v={VARIANTI[i % 3]}
              style={{
                "--t": `${durata(i)}s`,
                "--d": `${ritardo(i)}s`,
                "--s": `${(i * PASSO_ARCO).toFixed(2)}s`,
              }}
            />
          ))}

          {/* Stelle e numerazione */}

          {stelle.map(([x, y, r, classe = ""], i) => (
            <g key={`stella-${i}`}>
              <circle
                className={`stella ${classe}`}
                cx={xOrione(x)}
                cy={yOrione(y)}
                r={r}
                style={{ "--i": i }}
              />
            </g>
          ))}
        </svg>

        {/* Stesso viewBox di Orione: le coordinate coincidono, ma le
            animazioni di Orione (glitch, rosso, bagliore) non la toccano */}
        <svg
          className="cassiopea-cielo"
          viewBox="10 4 86 98"
          aria-hidden="true"
          focusable="false"
        >
          {/* CASSIOPEA, nascosta in alto a destra.
              Posizione e forma da coordinate reali (J2000): proiezione
              stereografica centrata su Alnilam, nord in alto, est a
              sinistra, come Orione. La direzione (≈62° sopra l'orizzontale,
              verso destra) è esatta; la distanza vera (~63°) e la scala
              sono ridotte perché stia nella pagina. */}

          <g className="cassiopea">
            <polyline
              className="cassiopea-linea"
              points="111.14,-28.84 109.16,-17.98 99.66,-21.34 94.69,-15.66 85.14,-17.09"
              pathLength={1}
            />
            <circle cx="111.14" cy="-28.84" r="1.2" /> {/* Caph    β */}
            <circle cx="109.16" cy="-17.98" r="1.3" /> {/* Schedar α */}
            <circle cx="99.66" cy="-21.34" r="1.2" /> {/* Navi    γ */}
            <circle cx="94.69" cy="-15.66" r="1" /> {/* Ruchbah δ */}
            <circle cx="85.14" cy="-17.09" r="0.8" /> {/* Segin   ε */}
          </g>
        </svg>
      </div>

      {/* FRASE */}

      <p className="frase">
        Orione fa rima con{" "}
        <input
          name="parola"
          type="text"
          aria-label="Parola che fa rima con Orione"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          autoFocus
          aria-invalid={stato?.errore ? "true" : undefined}
          disabled={inAttesa || accessoRiuscito}
        />
        .
      </p>

      <p className="istruzione">
        Inserisci la chiave per varcare l’orizzonte degli eventi.
      </p>

      {/* PULSANTE */}

      <button
        className="bottone"
        type="submit"
        disabled={inAttesa || accessoRiuscito}
      >
        {accessoRiuscito
          ? "Connessione stabilita"
          : inAttesa
            ? "Connessione..."
            : "Entra"}
      </button>

      {/* MESSAGGI */}

      {/* Errore: solo visivo, ma annunciato agli screen reader */}

      <p className="solo-lettori" role="status">
        {stato?.errore ? "Parola sbagliata." : ""}
      </p>

      {accessoRiuscito && (
        <p
          className="stato-successo"
          aria-live="polite"
          data-testo="[STATO: ENTANGLED]"
        >
          [STATO: ENTANGLED]
        </p>
      )}

      {/* LAMPO DI ACCESSO */}

      {accessoRiuscito && (
        <div className="lampo-accesso" aria-hidden="true" />
      )}
    </form>
  );
}