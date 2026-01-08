"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  useEffect(() => {
    const ambilUnit = async () => {
      try {
        const res = await fetch("/api/user/cek-user");
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const dataUnit = await res.json();

        if (dataUnit.profileCompleted === false) {
          router.push("/complete_profile");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    ambilUnit();
  }, [router]);

  return <div className="flex w-full h-screen justify-center items-center font-bold md:text-4xl text-center px-6">Sorry Halaman tidak ditemukan, Mengalihkan halaman ke Dashboard....</div>;
}
