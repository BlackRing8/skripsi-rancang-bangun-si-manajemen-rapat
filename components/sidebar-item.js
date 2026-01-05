"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export const SidebarItem = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pathname === "/pimpinan" && href === "/pimpinan") || (pathname === "/anggota" && href === "/anggota") || pathname === href;

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn("flex items-center gap-x-2 text-black text-sm font-[500px] pl-6 transition-all hover:text-white hover:bg-blue-500/20 ", isActive && "text-white bg-blue-400 hover:bg-blue-200 hover:text-white border-r-8 border-blue-300")}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon size={22} className={cn("text-slate-500", isActive && "text-white ")} />
        {label}
      </div>
      <div className={cn("ml-auto opacity-0 border-2 border-sky-400 h-full transition-all", isActive && "opacity-100")} />
    </button>
  );
};
