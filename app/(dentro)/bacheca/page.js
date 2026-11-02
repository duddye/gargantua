import Sezione from "../Sezione";

export const metadata = { title: "Bacheca" };

export default function Pagina({ searchParams }) {
  return <Sezione chiave="bacheca" searchParams={searchParams} />;
}
