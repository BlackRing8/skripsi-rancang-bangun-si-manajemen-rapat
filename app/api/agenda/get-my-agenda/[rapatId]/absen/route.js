import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { absenPeserta } from "@/services/agenda.service";
import { success } from "zod";

export async function POST(req, context) {
  // cek session ambil data user
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rapatId } = await context.params; //contoh id rapat = 9

  //ambil data yang dikirim
  const { pesertaId, namaPeserta, status } = await req.json();

  //   console.log("data diterima backend:", { pesertaId, status, rapatId });

  const validStatus = ["HADIR", "IZIN", "TIDAK_HADIR"];
  if (!validStatus.includes(status)) {
    return NextResponse.json({ error: "Status absensi tidak valid" }, { status: 400 });
  }

  try {
    const absensi = await absenPeserta({
      rapatId,
      pesertaId,
      status,
    });

    if (absensi.status === 404) {
      return NextResponse.json({ message: "rapat tidak ditemukan", absensi }, { status: 404 });
    }
    if (absensi.status === 403) {
      return NextResponse.json({ message: "Peserta tidak terdaftar pada rapat", absensi }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: `Absensi ${namaPeserta} berhasil`, absensi }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal melakukan absen/internal server error", error }, { status: 500 });
  }
}
