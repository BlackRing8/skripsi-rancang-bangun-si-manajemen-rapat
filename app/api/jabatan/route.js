import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get("unitId");

  if (!unitId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const jabatans = await prisma.jabatan.findMany({
      where: {
        unitId: Number(unitId),
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(jabatans);
  } catch (error) {
    console.error("Error fetching jabatans:", error);
    return NextResponse.json({ error: "Failed to fetch jabatans" }, { status: 500 });
  }
}
