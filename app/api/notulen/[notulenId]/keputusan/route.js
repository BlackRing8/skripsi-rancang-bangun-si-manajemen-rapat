import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";
import { NextResponse } from "next/server";
import { simpanKeputusanNotulen } from "@/services/notulen.service";

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pembuatId = session.user.id;

    let { notulenId } = context.params;
    notulenId = decodeId(notulenId);

    if (!notulenId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 404 });
    }

    const body = await req.json();

    const { keputusan } = body;

    console.log("data diterima backEnd:", keputusan);

    await simpanKeputusanNotulen({
      notulenId,
      keputusan,
      pembuatId,
    });

    return NextResponse.json({ message: "Keputusan berhasil disimpan" });
  } catch (error) {
    console.error("SIMPAN KEPUTUSAN ERROR FULL:", error);
    console.error("TYPE:", typeof error);
    console.error("KEYS:", Object.keys(error));

    return NextResponse.json(
      {
        message: error?.message ?? "Terjadi kesalahan saat menyimpan keputusan",
        error,
      },
      { status: 500 }
    );
  }
}
