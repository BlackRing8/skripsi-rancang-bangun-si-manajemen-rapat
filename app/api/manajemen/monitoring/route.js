import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { isSuperAdmin, getKepalaUnit, getSekretarisUnit } from "@/lib/auth";
import { rekapBanyakUser } from "@/lib/rekap";
import { getServerSession } from "next-auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);

  const start = new Date(searchParams.get("start"));
  const end = new Date(searchParams.get("end"));

  let targetUserIds = [];

  // ===== SUPER ADMIN =====
  if (await isSuperAdmin(userId)) {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    targetUserIds = users.map((u) => u.id);
  }

  // ===== KEPALA UNIT =====
  else {
    const kepalaUnits = await getKepalaUnit(userId);

    if (!kepalaUnits.length) {
      const sekretarisUnits = await getSekretarisUnit(userId);

      if (!sekretarisUnits.length) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const unitIds = sekretarisUnits.map((k) => k.unitId);

      const anggota = await prisma.userUnitJabatan.findMany({
        where: {
          unitId: { in: unitIds },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      targetUserIds = anggota.map((a) => a.userId);
    } else {
      const unitIds = kepalaUnits.map((k) => k.unitId);

      const anggota = await prisma.userUnitJabatan.findMany({
        where: {
          unitId: { in: unitIds },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      targetUserIds = anggota.map((a) => a.userId);
    }
  }

  // ===============================
  // AMBIL DATA USER (ID + NAME)
  // ===============================
  const users = await prisma.user.findMany({
    where: {
      id: { in: targetUserIds },
    },
    select: {
      id: true,
      name: true,
      unitJabatan: {
        select: {
          unit: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
  });

  // ===============================
  // AMBIL REKAP KEHADIRAN
  // ===============================
  const rekapMap = await rekapBanyakUser(targetUserIds, start, end);

  // ===============================
  // GABUNGKAN
  // ===============================
  const data = users
    .map((u) => {
      const stat = rekapMap[u.id] || { total: 0, hadir: 0 };
      const presentase = stat.total ? Math.round((stat.hadir / stat.total) * 100) : 0;

      // Ambil UNIT UNIK (walaupun jabatan lebih dari satu)
      const unitMap = {};

      u.unitJabatan.forEach((uj) => {
        unitMap[uj.unit.id] = uj.unit;
      });

      return Object.values(unitMap).map((unit) => ({
        userId: u.id,
        name: u.name || "-",
        unitId: unit.id,
        unitName: unit.nama,
        totalUndangan: stat.total,
        totalHadir: stat.hadir,
        presentase,
      }));
    })
    .flat();

  return NextResponse.json({ data });
}
