import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import { createRapatWithNotulen } from "@/services/agenda.service";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { judul, deskripsi, tanggalMulai, tanggalSelesai, lokasi, linkMeeting, peserta, unitTujuanIds } = body;

    const tanggalMulaiUtc = zonedTimeToUtc(tanggalMulai, "Asia/Jakarta");
    const tanggalSelesaiUtc = zonedTimeToUtc(tanggalSelesai, "Asia/Jakarta");

    const pesertaAgenda = peserta || [];

    const rapat = await createRapatWithNotulen({
      judul,
      deskripsi,
      tanggalMulai: tanggalMulaiUtc,
      tanggalSelesai: tanggalSelesaiUtc,
      lokasi,
      linkMeeting,
      pesertaAgenda,
      unitTujuanIds,
      pembuatId: Number(session.user.id),
    });

    return NextResponse.json({
      message: "Agenda rapat & notulen berhasil dibuat",
      rapatId: rapat.id,
    });
  } catch (error) {
    console.error("CREATE AGENDA ERROR:", error);

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
