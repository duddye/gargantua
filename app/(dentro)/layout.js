import MappaStellare from "../MappaStellare";
import { VOCI_MAPPA } from "../lib/mappa";

export default function LayoutDentro({ children }) {
  return (
    <main className="diario">
      <MappaStellare voci={VOCI_MAPPA} />
      {children}
    </main>
  );
}
