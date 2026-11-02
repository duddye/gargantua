import Sezione from "../Sezione";

export const metadata = { title: "Missioni" };

export default function Pagina({ searchParams }) {
  return <Sezione chiave="missioni" searchParams={searchParams} />;
}
