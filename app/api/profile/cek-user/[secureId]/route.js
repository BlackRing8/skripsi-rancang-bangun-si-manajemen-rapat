import { getUserById } from "@/services/profile.service";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";

export async function GET(req, context) {
  // //   Ambil session untuk validasi
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return NextResponse.json({ error: "unhauthorized" }, { status: 401 });
  // }

  const { secureId } = context.params;

  try {
    const userId = decodeId(secureId);

    const data = await getUserById(Number(userId));
    if (!data) {
      return NextResponse.json({ error: "data tidak ditemukan" }, { status: 404 });
    } else {
      console.log("data dari backEnd:", JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("gagal mengambil data user", error);
    return Response.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}
