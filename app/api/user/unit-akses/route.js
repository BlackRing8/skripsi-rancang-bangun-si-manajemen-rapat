import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ambilUnitAksesUser } from "@/services/user-akses.service";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const units = await ambilUnitAksesUser(userId);

  if (units.length === 0) {
    return NextResponse.json({ message: "Anda tidak memiliki hak membuat agenda rapat" }, { status: 403 });
  }

  return NextResponse.json(units);
}
