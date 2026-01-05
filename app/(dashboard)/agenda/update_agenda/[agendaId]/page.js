import UpdateRapatClient from "./UpdateRapatClient";

export default async function updateAgendaPage({ params }) {
  const { agendaId } = await params;
  return <UpdateRapatClient rapatId={agendaId} />;
}
