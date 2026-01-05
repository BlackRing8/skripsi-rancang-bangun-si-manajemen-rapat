import DetailRapat from "./DetailRapatClient";

export default async function detailAgendaPage({ params }) {
  const { agendaId } = await params;
  return <DetailRapat rapatId={agendaId} />;
}
