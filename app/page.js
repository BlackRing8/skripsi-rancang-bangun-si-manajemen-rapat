"use client";
// import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RolePage() {
  const router = useRouter();
  useEffect(() => {
    const ambilUnit = async () => {
      try {
        const res = await fetch("/api/profile/cek-user");
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const dataUnit = await res.json();
        const isAdmin = dataUnit.unitJabatan.some((uj) => uj.jabatan.nama.toLowerCase() === "admin");

        if (dataUnit.profileCompleted === false) {
          router.push("/complete_profile");
        } else if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    ambilUnit();
  }, [router]);

  return <div className="flex w-full h-screen justify-center items-center font-bold md:text-4xl">Loading.....</div>;
}
