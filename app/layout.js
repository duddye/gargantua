import { UnifrakturCook, Spectral, Cinzel } from "next/font/google";
import "./globals.css";

// Titoli gotici
const gotico = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-gotico",
});

// Testo da leggere
const testo = Spectral({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-testo",
});

// Etichette, date, bottoni
const etichetta = Cinzel({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-etichetta",
});

export const metadata = {
  title: "Punto di Singolarità",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="it"
      className={`${gotico.variable} ${testo.variable} ${etichetta.variable}`}
    >
      <body>
        {children}
        <footer className="piede">
          <p>
            <span className="frase-etichetta">Frase del giorno:</span>{" "}
            <span className="frase-testo">anche io con te voglio fare bene</span>
          </p>
        </footer>
      </body>
    </html>
  );
}