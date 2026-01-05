import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { updateAgendaById } from "@/services/agenda.service";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import { deleteAgendaById } from "@/services/agenda.service";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, judul, deskripsi, lokasi, start, end } = body;

  const tanggalMulai = zonedTimeToUtc(start.dateTime);
  const tanggalSelesai = zonedTimeToUtc(end.dateTime);

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
