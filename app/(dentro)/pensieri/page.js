import Sezione from "../Sezione";

export const metadata = { title: "Materia oscura" };

export default function Pagina({ searchParams }) {
  return <Sezione chiave="pensieri" searchParams={searchParams} />;
}
