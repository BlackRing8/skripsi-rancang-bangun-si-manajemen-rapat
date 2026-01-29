import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rekapRapatPerUnit } from "@/services/admin-rekap-rapat.service";
import { isSuperAdmin } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;

  const admin = await isSuperAdmin(adminId);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json({ message: "start dan end wajib diisi" }, { status: 400 });
  }

  // 🔥 FIX TANGGAL (INI PENTING)
  const start = new Date(startParam);
  const end = new Date(endParam);
  // ⬅️ FIX UTAMA

  const data = await rekapRapatPerUnit(start, end);

  console.log("data dari service:", JSON.stringify(data, null, 2));

  return NextResponse.json({
    start: start.toISOString(),
    end: end.toISOString(),
    totalUnit: data.length,
    data,
  });
}
