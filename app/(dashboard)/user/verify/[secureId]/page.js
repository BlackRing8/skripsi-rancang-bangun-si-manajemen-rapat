import DetailProfileUser from "./DetailProfileUser";

export default async function DetailProfilePage({ params }) {
  const { secureId } = await params;
  return <DetailProfileUser secureId={secureId} />;
}
