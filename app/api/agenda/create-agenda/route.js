import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import { createRapatWithNotulen } from "@/services/agenda.service";

const agendaSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional(),
  tanggalMulai: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggalMulai tidak valid",
  }),
  tanggalSelesai: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggalSelesai tidak valid",
  }),
  lokasi: z.string().optional(),
  linkMeeting: z.string().optional(),
  peserta: z
    .array(z.string())
    .optional()
    .transform((arr) => {
      if (!arr) return [];
      return Array.from(
        new Set(
          arr
            .map((s) => (s || "").trim())
            .filter((s) => s !== "")
            .map((s) => s.toLowerCase())
        )
      );
    })
    .refine((arr) => arr.every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)), {
      message: "Semua peserta harus dalam format email yang valid",
    }),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { judul, deskripsi, tanggalMulai, tanggalSelesai, lokasi, linkMeeting, peserta, agendas } = body;

    const tanggalMulaiUtc = zonedTimeToUtc(tanggalMulai, "Asia/Jakarta");
    const tanggalSelesaiUtc = zonedTimeToUtc(tanggalSelesai, "Asia/Jakarta");

    console.log;

    const pesertaAgenda = peserta || [];

    const rapat = await createRapatWithNotulen({
      judul,
      deskripsi,
      tanggalMulai: tanggalMulaiUtc,
      tanggalSelesai: tanggalSelesaiUtc,
      lokasi,
      linkMeeting,
      pesertaAgenda,
      agendas,
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
