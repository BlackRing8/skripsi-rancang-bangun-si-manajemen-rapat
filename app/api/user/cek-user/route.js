import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUserById } from "@/services/profile.service";

export async function GET() {
  // Ambil session untuk cek id nya di database
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "unhauthorized" }, { status: 401 });
  }

  const data = await getUserById(session.user.id);
  return NextResponse.json(data);
}
