import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeId } from "@/lib/secure-id";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json([]);

  // 🔎 Coba decode jika ID secure
  let decodedId = null;
  try {
    decodedId = decodeId(q);
  } catch {}

  const data = await prisma.rapat.findMany({
    where: {
      OR: [
        decodedId ? { id: decodedId } : undefined,
        {
          judul: {
            contains: q,
          },
        },
      ].filter(Boolean),
    },
    orderBy: { tanggalMulai: "desc" },
    take: 20,
  });

  return NextResponse.json(data);
}
