import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Ambil seluruh data unit
  try {
    const units = await prisma.unit.findMany({
      include: {
        jabatans: true,
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}
