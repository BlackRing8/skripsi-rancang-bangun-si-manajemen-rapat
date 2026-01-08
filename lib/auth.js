import { prisma } from "./prisma";

// SUPER ADMIN = punya unit "Admin"
export async function isSuperAdmin(userId) {
  const admin = await prisma.userUnitJabatan.findFirst({
    where: {
      userId,
      unit: {
        nama: "Admin",
      },
    },
  });

  return !!admin;
}

// KEPALA UNIT = jabatan mengandung kata "Kepala"
export async function getKepalaUnit(userId) {
  return prisma.userUnitJabatan.findMany({
    where: {
      userId,
      jabatan: {
        nama: {
          contains: "Kepala",
        },
      },
    },
    include: {
      unit: true,
    },
  });
}

// SEKRETARIS UNIT = jabatan mengandung kata Sekretaris
export async function getSekretarisUnit(userId) {
  return prisma.userUnitJabatan.findMany({
    where: {
      userId,
      jabatan: {
        nama: {
          contains: "Sekretaris",
        },
      },
    },
    include: {
      unit: true,
    },
  });
}
