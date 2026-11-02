"use client";

// Area di testo della chat: Invio trasmette, Maiusc+Invio va a capo.
export default function CampoMessaggio() {
  return (
    <textarea
      name="testo"
      rows={2}
      maxLength={2000}
      required
      placeholder="Scrivi un segnale…"
      aria-label="Messaggio"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          if (e.currentTarget.value.trim()) e.currentTarget.form.requestSubmit();
        }
      }}
    />
  );
}
