import {
  UnifrakturCook,
  Spectral,
  Cinzel,
  Share_Tech_Mono,
} from "next/font/google";
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

// Righe da terminale
const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Punto di Singolarità",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="it"
      className={`${gotico.variable} ${testo.variable} ${etichetta.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <footer className="piede">
          <p>Anche io con te voglio fare bene </p>
        </footer>
      </body>
    </html>
  );
}