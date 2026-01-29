"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const ambilUnit = async () => {
      try {
        const res = await fetch("/api/profile/cek-user");
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const dataUnit = await res.json();
        const isAdmin = dataUnit.unitJabatan.some((uj) => uj.jabatan.nama.toLowerCase() === "admin");

        if (!isAdmin) {
          return router.push("/not-found");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    ambilUnit();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center w-full h-screen">Memeriksa Akun...</div>;
  }

  return <main>{children}</main>;
}
