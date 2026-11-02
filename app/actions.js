"use server";

import { cookies } from "next/headers";
import { faRima, tokenAccesso } from "./lib/accesso";

export async function verifica(statoPrecedente, formData) {
  const parola = formData.get("parola") ?? "";

  if (faRima(parola)) {
    const biscotti = await cookies();
    biscotti.set("accesso", tokenAccesso(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
      path: "/",
    });
    // Il redirect lo fa il client, dopo l'animazione della costellazione
    return { successo: true };
  }

  // Contatore: ogni tentativo sbagliato fa ripartire l'effetto rosso
  return { errore: true, tentativo: (statoPrecedente?.tentativo ?? 0) + 1 };
}