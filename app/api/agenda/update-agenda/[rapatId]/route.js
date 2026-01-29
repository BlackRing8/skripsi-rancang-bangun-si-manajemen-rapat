import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { updateAgendaById } from "@/services/agenda.service";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import { deleteAgendaById } from "@/services/agenda.service";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { id, judul, deskripsi, lokasi, tanggalMulai, tanggalSelesai, pesertaEmails } = body;

  if (!judul || !tanggalMulai || !tanggalSelesai) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // ⏱️ KONVERSI WIB → UTC (BENAR)
  const startUtc = zonedTimeToUtc(new Date(tanggalMulai), "Asia/Jakarta");

  const endUtc = zonedTimeToUtc(new Date(tanggalSelesai), "Asia/Jakarta");

  try {
    const agenda = await updateAgendaById({
      id,
      judul,
      deskripsi,
      lokasi,
      tanggalMulai: startUtc,
      tanggalSelesai: endUtc,
      pesertaEmails,
    });

    return NextResponse.json({
      message: "Agenda berhasil diperbarui",
      agenda,
    });
  } catch (error) {
    console.error("Update agenda error:", error);
    return NextResponse.json({ error: "Gagal memperbarui agenda" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { rapatId } = params;

  // console.log(rapatId);
  const deleteRapat = await deleteAgendaById(rapatId);
  if (!deleteRapat) {
    return Response.json({ message: "Rapat tidak ditemukan" }, { status: 404 });
  }

  return Response.json({
    message: "Rapat berhasil dihapus",
    rapatId: deleteRapat,
  });
}

// SISTEM LAMA / SEBELUM REVISI

export async function PATCHLama(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, judul, deskripsi, lokasi, start, end } = body;

  const tanggalMulai = zonedTimeToUtc(start.dateTime, "Asia/Jakarta");
  const tanggalSelesai = zonedTimeToUtc(end.dateTime, "Asia/Jakarta");

  console.log(tanggalMulai + "-" + tanggalSelesai);

  try {
    const updatedAgenda = await updateAgendaById({
      id,
      judul,
      deskripsi,
      lokasi,
      tanggalMulai,
      tanggalSelesai,
    });

    return NextResponse.json({ message: "Agenda berhasil diperbarui", agenda: updatedAgenda });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Gagal memperbarui agenda" }, { status: 500 });
  }
}
