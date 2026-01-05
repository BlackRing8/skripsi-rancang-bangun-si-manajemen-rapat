"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UpdateRapatClient({ rapatId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetailRapat = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/agenda/get-my-agenda/${rapatId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data rapat");
        }

        const data = await response.json();
        console.log("data rapat:", data);
        setRapat(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchDetailRapat();
  }, [rapatId, session]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!rapat) return <p>Data rapat tidak ditemukan</p>;
  if (rapat.pembuatId !== session?.user?.id) {
    alert("Anda tidak memiliki akses untuk mengupdate rapat ini.");
    router.push("/dashboard");
  }

  return (
    <div>
      Update Rapat Client for Rapat ID: {rapatId}
      <div>judul: {rapat.pembuatId}</div>
      {session?.user?.id}
    </div>
  );
}
