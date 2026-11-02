"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { COSTELLAZIONI } from "./lib/costellazioni";

// =========================================================
// IL CIELO CHE SI MUOVE
// 1. Scrive lo scroll in --cielo-y: gli strati di stelle dello
//    sfondo (globals.css) scorrono a velocità diverse.
// 2. Disegna la costellazione della sezione corrente, che entra
//    con uno "shift" (scivola + sdoppiamento RGB) a ogni cambio pagina.
// =========================================================

export default function Cielo() {
  const percorso = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const radice = document.documentElement;
    let richiesta = 0;
    const aggiorna = () => {
      richiesta = 0;
      radice.style.setProperty("--cielo-y", String(Math.round(window.scrollY)));
    };
    const alloScroll = () => {
      if (!richiesta) richiesta = requestAnimationFrame(aggiorna);
    };

    aggiorna();
    window.addEventListener("scroll", alloScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", alloScroll);
      cancelAnimationFrame(richiesta);
    };
  }, []);

  const c = COSTELLAZIONI[percorso];
  if (!c) return null;

  return (
    // key: a ogni cambio di sezione l'animazione d'ingresso riparte
    <div key={percorso} className="cielo-costellazione" aria-hidden="true">
      <svg viewBox="-8 -8 116 122" className="cielo-svg">
        {c.linee.map(([a, b], i) => (
          <line
            key={`${a}-${b}`}
            className="cielo-linea"
            x1={c.stelle[a].x}
            y1={c.stelle[a].y}
            x2={c.stelle[b].x}
            y2={c.stelle[b].y}
            pathLength={1}
            style={{ "--i": i }}
          />
        ))}

        {c.speciale && (
          <g className="cielo-speciale">
            <circle cx={c.speciale.x} cy={c.speciale.y} r="3.2" className="cielo-speciale-alone" />
            <circle cx={c.speciale.x} cy={c.speciale.y} r="1.3" className="cielo-speciale-centro" />
            <title>{c.speciale.nome}</title>
          </g>
        )}

        {c.stelle.map((s, i) => (
          <circle
            key={s.nome}
            className="cielo-stella"
            cx={s.x}
            cy={s.y}
            r={s.r}
            style={{ "--i": i }}
          >
            <title>{s.nome}</title>
          </circle>
        ))}

        <text x="50" y="111" className="cielo-nome" textAnchor="middle">
          {c.latino.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
