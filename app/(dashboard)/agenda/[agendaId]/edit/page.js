import UpdateRapat from "./UpdateRapatClient";

export default async function UpdateAgendaPage({ params }) {
  const { agendaId } = await params;
  return <UpdateRapat rapatId={agendaId} />;
}
