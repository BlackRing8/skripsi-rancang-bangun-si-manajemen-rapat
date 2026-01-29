"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    const ambilUnit = async () => {
      try {
        const res = await fetch("/api/profile/cek-user");
        if (!res.ok) throw new Error("Gagal mengambil data rapat");
        const dataUnit = await res.json();

        if (dataUnit.profileCompleted === false) {
          router.push("/complete_profile");
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    ambilUnit();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="max-h-screen ">
        <div className="h-[90px] xl:pl-56 fixed inset-y-0 w-full z-50">
          <Navbar />
        </div>
        <div className="hidden xl:flex h-full w-56 flex-col fixed inset-y-0 z-50 bg-red-500">
          <Sidebar />
        </div>
        <main className="xl:pl-56 pt-[90px] h-screen flex items-center justify-center">
          {" "}
          <div className="">
            <p className=" text-xl ">Memuat data akun...</p>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className=" ">
      <div className="h-20 xl:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden xl:flex h-full w-auto flex-col fixed inset-y-0 z-50 ">
        <Sidebar />
      </div>
      <main className="xl:pl-64 pt-[100px] h-full ">{children}</main>
    </div>
  );
}
