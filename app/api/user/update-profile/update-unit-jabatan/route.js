import { tambahUnitJabatan } from "@/services/profile.service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { selections } = await req.json();

  try {
    await tambahUnitJabatan(session.user.id, selections);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "SELECTION_EMPTY") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
