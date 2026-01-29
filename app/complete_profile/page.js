"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();

  // const [units, setUnits] = useState([]);
  // const [rows, setRows] = useState([
  //   { unitId: "", jabatanOptions: [], jabatanId: "" }, // minimal 1 row
  // ]);

  const [loading, setLoading] = useState(false);

  // =============================
  // CEK USER: kalau sudah lengkap → redirect
  // =============================
  useEffect(() => {
    const cekUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/profile/cek-user");
        const data = await res.json();

        if (data.profileCompleted === true) {
          return router.push("/panel");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };

    cekUser();
  }, [router]);

  // =============================
  // LOADING SCREEN
  // =============================
  if (loading) {
    return <div className="flex w-full h-screen justify-center items-center text-lg font-bold">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      // Logout dari next-auth session secara realtime
      await signOut({ redirect: true, callbackUrl: "/login" });

      Swal.fire({
        heightAuto: false,
        position: "top-center",
        icon: "success",
        title: "Anda telah Log Out!",
        showConfirmButton: false,
        timer: 1000,
        scrollbarPadding: false,
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="flex w-full min-h-screen bg-linear-to-br from-white via-indigo-300 to-white justify-center items-center p-4">
      <div className="flex flex-col text-center items-center">
        <h1 className="font-bold text-xl md:text-4xl">WAITING PAGE</h1>
        <p className="md:text-xl font-semibold">
          Menunggu Validasi Admin. Anda dapat lanjut menggunakan fitur setelah admin memvalidasi. <br></br>Silahkan Login kembali nanti...
        </p>
        <button onClick={handleLogout} className="w-40 justify-center rounded-xl flex items-center mt-8 gap-2 px-3 py-4 text-md text-white bg-red-500 hover:bg-red-300 hover:text-white">
          <LogOut className="w-6 h-6" /> Keluar
        </button>
      </div>
    </div>
  );
}

// melihatmu bersemi dan bermekaran
