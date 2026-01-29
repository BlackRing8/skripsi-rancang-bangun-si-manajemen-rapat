import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { ambilCardAgendaAdmin } from "@/services/dashboard.service";
import { isSuperAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;

    // 🔒 CEK ADMIN
    const admin = await isSuperAdmin(adminId);
    if (!admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ambilAgenda = await ambilCardAgendaAdmin(adminId);

    console.log(ambilAgenda);
    return Response.json(ambilAgenda);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
