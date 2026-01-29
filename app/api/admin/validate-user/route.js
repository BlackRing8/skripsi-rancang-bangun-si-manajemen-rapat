import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ambilUserBaru } from "@/services/admin-user.service";
import { validateUser } from "@/services/admin-user.service";

export async function GET() {
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

  try {
    const data = await ambilUserBaru();
    console.log("data user baru:", JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gagal mengambil data", error);
    return NextResponse.json({ message: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function PATCH(req) {
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

  const { secureId } = body;

  try {
    const userValid = await validateUser(secureId);
    return NextResponse.json({ message: "berhasil memvalidasi user", userValid }, { status: 200 });
  } catch (error) {
    console.error("Gagal memvalidasi user", error);
    return NextResponse.json({ message: "Gagal memvalidasi user" }, { status: 500 });
  }
}
