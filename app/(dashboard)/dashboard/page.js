"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  return (
    <div>
      DashboardPanel
      <h1>{session?.user?.email}</h1>
    </div>
  );
}
