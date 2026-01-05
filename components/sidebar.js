"use client";
import { Logo } from "./logo";
import SidebarRoutes from "./sidebar-routes";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="h-full  flex flex-col overflow-y-auto w-64 bg-sky-200 shadow-sm overflow-x-hidden">
        <div className="">
          <Logo />
        </div>
        <div className="flex-col w-full h-60 ">
          <div className="flex w-full h-44 ">
            <div className="w-40 h-40 rounded-full border-gray-400 border bg-gray-200 m-auto justify-center items-start flex-col pt-5">
              <div className="w-15 h-15 rounded-full bg-white mx-auto"></div>
              <div className="w-20 h-15 rounded-t-full bg-white mx-auto"></div>
            </div>
          </div>
          <div className="flex w-full h-16">
            <h1 className="font-bold text-center my-auto mx-auto text-gray-500 ">Memuat data...</h1>
          </div>
        </div>
        <div className="flex flex-col w-full ">
          <SidebarRoutes />
        </div>
      </div>
    );
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

  return (
    <div className="h-full  flex flex-col overflow-y-auto w-64 bg-sky-200 shadow-sm overflow-x-hidden">
      <div className="">
        <Logo />
      </div>
      <div className="flex-col w-full h-60 mb-2">
        <div className="flex w-full h-44 ">
          <img src={session.user?.image} className="w-40 h-40 rounded-full border-white border-8 bg-gray-200 m-auto" />
        </div>
        <div className="flex flex-col w-full h-16 px-2">
          <h1 className="font-bold text-center w-full text-lg">{session.user?.name}</h1>
        </div>
      </div>
      <div className="flex flex-col w-full ">
        <SidebarRoutes />
        <button onClick={handleLogout} className="w-full flex items-center ml-3.5 gap-2 px-3 py-4 text-md text-red-600 hover:bg-red-500 hover:text-white">
          <LogOut className="w-6 h-6" /> Keluar
        </button>
      </div>
    </div>
  );
};
