import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";
import { ambilDraftNotulen } from "@/services/notulen.service";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let { notulenId } = await context.params;

  notulenId = decodeId(notulenId);

  //   console.log("data diterima backend:", notulenId);

  if (notulenId === null) {
    return NextResponse.error({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  const draft = await ambilDraftNotulen(notulenId);

  //   console.log("data hasil service:", { draft });

  //   if (session.user.id !== draft.dibuatOleh) {
  //     return NextResponse.json({ message: "Anda tidak memiliki akses" }, { status: 403 });
  //   }

  return NextResponse.json(draft);
}
