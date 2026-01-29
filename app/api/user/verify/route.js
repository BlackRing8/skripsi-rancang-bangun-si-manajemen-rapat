import { NextResponse } from "next/server";
import { encodeId } from "@/lib/secure-id";
import { ambilListUser } from "@/services/admin-user.service";

export async function GET() {
  try {
    const rows = await ambilListUser();

    const unitMap = {};

    for (const row of rows) {
      const unitName = row.unit.nama;
      const userId = row.user.id;

      if (!unitMap[unitName]) {
        unitMap[unitName] = {};
      }

      if (!unitMap[unitName][userId]) {
        unitMap[unitName][userId] = {
          secureId: encodeId(userId),
          name: row.user.name,
          email: row.user.email,
          nik: row.user.nik,
          jabatan: [],
        };
      }

      unitMap[unitName][userId].jabatan.push(row.jabatan.nama);
    }

    // Convert ke array
    const result = Object.entries(unitMap).map(([unit, users]) => ({
      unit,
      users: Object.values(users),
    }));

    // lihat data
    console.log("DATA USERS BY UNIT:", JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error) {
    console.error("ADMIN USERS BY UNIT ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil data user" }, { status: 500 });
  }
}
