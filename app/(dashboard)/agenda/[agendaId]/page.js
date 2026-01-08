import DetailRapat from "./DetailRapatClient";

export default async function DetailAgendaPage({ params }) {
  const { agendaId } = await params;
  return <DetailRapat rapatId={agendaId} />;
}
