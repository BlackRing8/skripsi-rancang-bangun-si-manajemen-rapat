import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";
import { hapusUser } from "@/services/admin-user.service";
import { isSuperAdmin } from "@/lib/auth";

export async function DELETE(req, context) {
  try {
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

    const { secureId } = context.params;
    console.log("id diterima backEnd:", secureId);

    const userTarget = decodeId(secureId);

    console.log("id diproses backEnd menjadi:", userTarget);

    // ❌ tidak boleh hapus diri sendiri
    if (Number(userTarget) === Number(adminId)) {
      return NextResponse.json({ message: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    await hapusUser(userTarget);

    return NextResponse.json({ message: "user berhasil di hapus" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ message: error.message || "Gagal menghapus user" }, { status: 500 });
  }
}
