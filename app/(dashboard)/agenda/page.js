"use client";
import { hasAccess } from "@/lib/access";
import { PERMISSIONS } from "@/lib/permission";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EventTabs from "@/components/agenda_components/event-tabs";

export default function AgendaPage() {
  const { data: session } = useSession();
  const router = useRouter;
  if (!session) {
    return router.push("/login");
  }

  const isDisabled = !hasAccess(session?.user?.jabatans, PERMISSIONS.AGENDA_MANAGE);

  return (
    <div className="m-6 lg:m-10 flex flex-col items-start">
      <button
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            window.location.href = "/agenda/create_agenda";
          }
        }}
        className={`${isDisabled ? "px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:cursor-not-allowed" : "px-2.5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-400"}`}
      >
        {isDisabled ? "Akses Ditolak" : " + Buat agenda rapat"}
      </button>
      <EventTabs />
    </div>
  );
}
