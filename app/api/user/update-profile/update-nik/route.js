import { updateNikUser } from "@/services/profile.service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse, json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { nik } = await req.json();

  try {
    const user = await updateNikUser(session.user.email, nik);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error.message === "INVALID_NAME") {
      return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
