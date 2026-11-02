"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Ricarica i dati del server ogni tot secondi, solo se la scheda è visibile:
// così i messaggi dell'altra persona arrivano senza ricaricare la pagina.
export default function Sintonizzatore({ ogniSecondi = 8 }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ogniSecondi * 1000);
    return () => clearInterval(id);
  }, [router, ogniSecondi]);

  return null;
}
