import { NextResponse } from "next/server";
import { tambahUnitJabatan, hapusUnitJabatan } from "@/services/profile.service";
import { decodeId } from "@/lib/secure-id";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  const { secureId, selections } = await req.json();

  const userId = decodeId(secureId);

  try {
    await tambahUnitJabatan(userId, selections);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "SELECTION_EMPTY") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
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
  console.log("data diterima backEnd:", { body });

  const { secureId, id } = body;

  const userId = decodeId(secureId);

  try {
    await hapusUnitJabatan(userId, Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
