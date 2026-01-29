import { updateNamaUser } from "@/services/profile.service";
import { NextResponse } from "next/server";
import { decodeId } from "@/lib/secure-id";
import { getServerSession } from "next-auth";
import { isSuperAdmin } from "@/lib/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  const { secureId, name } = await req.json();

  const userId = decodeId(secureId);

  console.log("data diterima backend:", userId, name);

  try {
    const user = await updateNamaUser(userId, name);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error.message === "INVALID_NAME") {
      return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
