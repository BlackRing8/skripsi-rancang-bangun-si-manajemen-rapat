import EditProfileUser from "./EditProfileUser";

export default async function DetailProfilePage({ params }) {
  const { secureId } = await params;
  return <EditProfileUser secureId={secureId} />;
}
