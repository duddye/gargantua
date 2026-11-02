"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigazione tra le regioni del diario.
// I dati arrivano dal server (sezioni.js) come semplici stringhe.
export default function MappaStellare({ voci }) {
  const percorso = usePathname();

  return (
    <nav className="mappa-stellare" aria-label="Mappa stellare">
      <ul>
        {voci.map((v) => (
          <li key={v.percorso}>
            <Link
              href={v.percorso}
              aria-current={percorso === v.percorso ? "page" : undefined}
            >
              <span className="mappa-simbolo" aria-hidden="true">
                {v.simbolo}
              </span>
              <span className="mappa-nome">{v.titolo}</span>
              <span className="mappa-sotto">{v.sotto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
