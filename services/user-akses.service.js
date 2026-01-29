import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth";

export async function ambilUnitAksesUser(userId) {
  // 🔥 SUPER ADMIN → SEMUA UNIT
  const superAdmin = await isSuperAdmin(userId);
  if (superAdmin) {
    return prisma.unit.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });
  }

  // 🔥 KEPALA + SEKRETARIS SAJA
  const unitAkses = await prisma.userUnitJabatan.findMany({
    where: {
      userId,
      OR: [{ jabatan: { nama: { contains: "Kepala" } } }, { jabatan: { nama: { contains: "Sekretaris" } } }],
    },
    select: {
      unit: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
  });

  // Hilangkan duplikat
  const map = new Map();
  unitAkses.forEach((u) => map.set(u.unit.id, u.unit));

  return Array.from(map.values());
}
