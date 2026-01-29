import { prisma } from "@/lib/prisma";

export async function rekapRapatPerUnit(start, end) {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  // 1️⃣ Ambil SEMUA unit
  const units = await prisma.unit.findMany({
    select: {
      id: true,
      nama: true,
    },
  });

  // 2️⃣ Inisialisasi map dari semua unit
  const map = {};
  for (const unit of units) {
    map[unit.id] = {
      unitId: unit.id,
      unitNama: unit.nama,
      totalRapat: 0,
      selesai: 0,
      belumMulai: 0,
    };
  }

  // 3️⃣ Ambil rapat dalam rentang waktu
  const rapats = await prisma.rapat.findMany({
    where: {
      tanggalMulai: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      status: true,
      unitTujuan: {
        select: {
          id: true,
        },
      },
    },
  });

  // 4️⃣ Hitung rapat ke unit
  for (const rapat of rapats) {
    for (const unit of rapat.unitTujuan) {
      const target = map[unit.id];
      if (!target) continue;

      target.totalRapat++;

      if (rapat.status === "SELESAI") {
        target.selesai++;
      } else {
        target.belumMulai++;
      }
    }
  }

  return Object.values(map);
}
