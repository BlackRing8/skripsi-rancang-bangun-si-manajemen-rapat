import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { finalisasiNotulen } from "@/services/notulen.service";
import { decodeId } from "@/lib/secure-id";

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pembuatId = session.user.id;

    let { notulenId } = context.params;
    notulenId = decodeId(notulenId);

    console.log("data diterima backEnd:", notulenId);

    if (!notulenId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 404 });
    }

    const result = await finalisasiNotulen({ notulenId, pembuatId });

    return NextResponse.json({
      message: "Notulen berhasil difinalisasi dan dikunci",
      notulen: result,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal finalisasi notulen" }, { status: 400 });
  }
}
