import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { selections } = body;

  const idUser = session.user.id;

  if (!Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: "userId, unitId, jabatanId wajib diisi" }, { status: 400 });
  }

  try {
    // Tambah relasi user -> unit + jabatan
    const update = await prisma.userUnitJabatan.createMany({
      data: selections.map((item) => ({
        userId: idUser,
        unitId: Number(item.unitId),
        jabatanId: Number(item.jabatanId),
      })),
    });

    // Tandai user sudah lengkap profilnya (jika kamu punya field ini)
    const user = await prisma.user.update({
      where: { id: idUser },
      data: { profileCompleted: true },
    });

    return NextResponse.json({ success: true, message: "profil berhasil disimpan" }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
