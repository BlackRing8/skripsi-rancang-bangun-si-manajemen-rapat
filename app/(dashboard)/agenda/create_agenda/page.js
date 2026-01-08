"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasAccess } from "@/lib/access";
import { PERMISSIONS } from "@/lib/permission";

import FormAgenda from "@/components/agenda_components/form-agenda";

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Pastikan session sudah loaded
    if (status === "loading") return;

    const isBanned = !hasAccess(session?.user?.jabatans, PERMISSIONS.AGENDA_MANAGE);

    if (isBanned) {
      router.replace("/agenda"); // gunakan replace biar tidak bisa back
    }
  }, [session, status, router]);

  // Selama session loading → tampilkan loading
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Jangan render page jika user banned (redirect sedang berjalan)
  const isBanned = !hasAccess(session?.user?.jabatans, PERMISSIONS.AGENDA_MANAGE);
  if (isBanned) return null;

  return (
    <div>
      <FormAgenda />
    </div>
  );
}
