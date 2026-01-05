import DetailEditNotulen from "./DetailEditNotulen";

export default async function Page({ params }) {
  const { notulenId } = await params;
  return <DetailEditNotulen notulenId={notulenId} />;
}
