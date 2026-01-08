import { prisma } from "./prisma";

// Rekap 1 user
export async function rekapUser(userId, start, end) {
  const data = await prisma.rapatPeserta.findMany({
    where: {
      userId,
      rapat: {
        tanggalMulai: {
          gte: start,
          lte: end,
        },
      },
    },
  });

  const totalUndangan = data.length;
  const totalHadir = data.filter((d) => d.status === "HADIR").length;

  return {
    userId,
    totalUndangan,
    totalHadir,
    presentase: totalUndangan ? Math.round((totalHadir / totalUndangan) * 100) : 0,
  };
}

// Rekap banyak user
export async function rekapBanyakUser(userIds, start, end) {
  const peserta = await prisma.rapatPeserta.findMany({
    where: {
      userId: { in: userIds },
      rapat: {
        tanggalMulai: {
          gte: start,
          lte: end,
        },
      },
    },
  });

  const map = {};

  for (const p of peserta) {
    const uid = p.userId;

    if (!map[uid]) {
      map[uid] = { total: 0, hadir: 0 };
    }

    map[uid].total += 1;

    // ⚠️ SESUAIKAN DENGAN VALUE DI DB
    if (p.status === "HADIR") {
      map[uid].hadir += 1;
    }
  }

  return map;
}
