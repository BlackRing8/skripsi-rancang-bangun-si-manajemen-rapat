import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      include: {
        userUnitJabatan: {
          include: {
            user: true,
            jabatan: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    const formatted = units
      .map((unit) => ({
        id: unit.id,
        nama: unit.nama,
        users: unit.userUnitJabatan.map((uuj) => ({
          id: uuj.user.id,
          name: uuj.user.name,
          email: uuj.user.email,
          jabatans: [uuj.jabatan.nama], // jika 1 user bisa punya banyak jabatan, bisa di-group
        })),
      }))
      .filter((unit) => unit.users.length > 0); // hanya tampilkan unit yang ada usernya

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return NextResponse.json({ error: "Gagal mengambil data user per unit" }, { status: 500 });
  }
}
