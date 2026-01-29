"use client";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function NavbarRoutes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

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

  if (status === "loading") {
    return (
      <div className="flex gap-x-2 mx-4 md:mx-10 justify-end w-full">
        {/* <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari rapat, pengguna..."
            className="w-full border rounded-md py-2 pl-10 pr-4 bg-gray-100  placeholder:text-gray-700 border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-500 ">
            <Search size={25} />
          </span>
        </div> */}
        <div className="flex items-center gap-4">
          {/* Notif */}
          <div className="relative">
            {/* <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-gray-700 hover:text-blue-600  rounded-md bg-gray-200 py-2 px-3">
              <Bell className="w-6 h-6" />
              {notifications.some((n) => !n.isRead) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
            </button> */}

            {/* {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <div className="p-2 font-semibold border-b">Notifikasi</div>
              {notifications.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm text-center">Tidak ada notifikasi baru</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-gray-50 border-b text-sm cursor-pointer">
                    <p className="font-medium">{n.title}</p>
                    {n.message && <p className="text-gray-600">{n.message}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                ))
              )}
            </div>
          )} */}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-1 border rounded-md p-1 hover:bg-gray-50">
              <User className="w-8 h-8 rounded-full opacity-50" />
            </button>
          </div>
        </div>
        {/* <button onClick={handleLogout} className=" px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-red-500 font-semibold transition text-xl">
        Logout
      </button> */}
      </div>
    );
  }

  return (
    <div className="flex gap-x-2 mx-0 md:mx-10 justify-between w-full">
      {/* <div className="relative grid w-60 text-sm md:text-xl font-bold items-center">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div> */}
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Cari agenda (ID / Judul)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </form>
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-1 border rounded-md p-1 hover:bg-gray-50">
            <img src={session.user?.image} alt="profile" className="rounded-full h-8 w-8" referrerPolicy="no-referrer" />
            {/* <span className="hidden md:inline text-sm">{session.user?.name || "User"}</span> */}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <div className="p-3 border-b text-sm">
                <div className="flex mb-1.5">
                  <img src={session.user?.image} alt="profile" className="rounded-full h-10 w-10 mr-1.5" />
                  <div className="flex-col">
                    <p className="font-medium">{session?.user?.name}</p>
                    <Link href="/profile" className="text-blue-500 underline">
                      Lihat Profile
                    </Link>
                  </div>
                </div>

                <p className="text-gray-500 text-xs truncate">{session?.user?.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
