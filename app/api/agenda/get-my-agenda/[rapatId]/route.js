import { NextResponse } from "next/server";
import { getDetailAgenda } from "@/services/agenda.service";
import { encodeId } from "@/lib/secure-id";

export async function GET(req, context) {
  const { rapatId } = context.params;
  try {
    const detailRapat = await getDetailAgenda(rapatId);
    if (!detailRapat) {
      return NextResponse.json({ error: "rapat tidak ditemukan" }, { status: 404 });
    }

    // 🔐 Encode notulen.id sebelum dikirim ke client
    if (detailRapat.notulen?.id) {
      detailRapat.notulen.id = await encodeId(detailRapat.notulen.id);
    }

    return NextResponse.json(detailRapat);
  } catch (error) {
    console.error("gagal mengambil detail rapat", error);
    return Response.json({ error: "Gagal mengambil detail rapat" }, { status: 500 });
  }
}
