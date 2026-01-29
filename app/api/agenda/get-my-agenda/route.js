import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getMyAgenda } from "@/services/agenda.service";
import { getAllAgenda } from "@/services/agenda.service";
import { NextResponse } from "next/server";
import { encodeId } from "@/lib/secure-id";
import { isSuperAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 🔒 CEK ADMIN
    const isAdmin = await isSuperAdmin(userId);
    if (isAdmin) {
      const allRapat = await getAllAgenda();

      const allHasil = allRapat.map((r) => ({
        ...r,
        sayaPembuat: r.pembuatId === userId,
        sayaPeserta: r.pembuatId !== userId,
        secureId: encodeId(r.notulen.id),
      }));

      console.log("data diambil:", allHasil);

      return NextResponse.json(allHasil);
    } else {
      const rapat = await getMyAgenda(userId, userEmail);

      const hasil = rapat.map((r) => ({
        ...r,
        sayaPembuat: r.pembuatId === userId,
        sayaPeserta: r.pembuatId !== userId,
        secureId: encodeId(r.notulen.id),
      }));

      console.log("data diambil:", hasil);

      return NextResponse.json(hasil);
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal mengambil data rapat" }, { status: 500 });
  }
}
