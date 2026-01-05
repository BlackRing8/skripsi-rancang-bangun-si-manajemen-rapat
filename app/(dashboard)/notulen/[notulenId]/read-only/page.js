import LihatNotulen from "./LihatNotulen";

export default async function Page({ params }) {
  const { notulenId } = await params;
  return <LihatNotulen notulenId={notulenId} />;
}
