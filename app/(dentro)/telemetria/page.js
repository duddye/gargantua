import Sezione from "../Sezione";

export const metadata = { title: "Telemetria" };

export default function Pagina({ searchParams }) {
  return <Sezione chiave="telemetria" searchParams={searchParams} />;
}
