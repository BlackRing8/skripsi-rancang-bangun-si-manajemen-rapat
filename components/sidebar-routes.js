"use client";
import { Calendar, Compass, AppWindow, Users, User } from "lucide-react";

import { useSession } from "next-auth/react";

import { SidebarItem } from "./sidebar-item";

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
  {
    label: "Lihat Profil",
    icon: User,
    href: "/profile",
  },
];
const adminRoutes = [
  {
    label: "Panel Monitor",
    icon: AppWindow,
    href: "/admin",
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
  {
    label: "Lihat Profil",
    icon: User,
    href: "/profile",
  },
];

const SidebarRoutes = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Memuat data...</div>;
  }

  // fallback jika session belum ada
  if (!session?.user) {
    return null;
  }

  // 🔑 CEK APAKAH USER ADMIN
  const isAdmin = session.user.jabatans?.some((jabatan) => jabatan.toLowerCase() === "admin");

  const routes = isAdmin ? adminRoutes : userRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  );
};

export default SidebarRoutes;
