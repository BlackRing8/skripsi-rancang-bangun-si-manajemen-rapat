import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { tambahUser } from "@/services/admin-user.service";
import { isSuperAdmin } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id;

  // 🔒 CEK ADMIN
  const admin = await isSuperAdmin(adminId);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, nik, selections } = body;

  console.log("data diterima server:", JSON.stringify(body, null, 2));

  if (!Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: "userId, unitId, jabatanId wajib diisi" }, { status: 400 });
  }

  try {
    const userCreate = await tambahUser({
      email,
      name,
      nik,
      selections,
    });
    return NextResponse.json({ message: "user berhasil di buat" });
  } catch (error) {
    console.error("TAMBAH USER ERROR:", error);
    return NextResponse.json({ message: error.message || "Gagal membuat user" }, { status: 500 });
  }
}
