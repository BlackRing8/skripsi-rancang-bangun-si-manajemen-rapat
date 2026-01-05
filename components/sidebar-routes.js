"use client";
import { Calendar, Compass, Library, Users, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { SidebarItem } from "./sidebar-item";
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

const userRoutes = [
  {
    label: "Dashboard",
    icon: Compass,
    href: "/dashboard",
  },
  {
    label: "Agenda Rapat",
    icon: Calendar,
    href: "/agenda",
  },
  {
    label: "Manajemen Anggota",
    icon: Users,
    href: "/manajemen",
  },
  // {
  //   label: "Notulen dan dokumen",
  //   icon: Library,
  //   href: "/notulen",
  // },
  {
    label: "Lihat Profil",
    icon: User,
    href: "/profile",
  },
];

const SidebarRoutes = () => {
  const pathname = usePathname();

  const isPimpinanPage = pathname?.includes("/");

  const routes = isPimpinanPage ? userRoutes : anggotaRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  );
};

export default SidebarRoutes;
