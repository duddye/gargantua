"use client";

import Form from "next/form";

// Modulo dei filtri: navigazione GET (i filtri finiscono nell'URL,
// quindi si possono salvare e condividere). Caselle, pulsanti e menu
// applicano il filtro subito; la ricerca testuale con Invio.
export default function ModuloFiltri({ azione, children }) {
  return (
    <Form
      action={azione}
      className="filtri-avanzati"
      scroll={false}
      onChange={(e) => {
        const tipo = e.target.type;
        if (tipo !== "search" && tipo !== "text") e.currentTarget.requestSubmit();
      }}
    >
      {children}
    </Form>
  );
}
