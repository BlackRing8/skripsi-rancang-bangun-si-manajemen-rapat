import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { ambilCardAgenda } from "@/services/dashboard.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const ambilAgenda = await ambilCardAgenda(userId);

    console.log(ambilAgenda);
    return Response.json(ambilAgenda);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
