import { prisma } from "@/lib/prisma";

//----------------------------------------//
// -------- Ambil data User ------------- //
//----------------------------------------//
export async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      nik: true,
      profileCompleted: true,
      unitJabatan: {
        select: {
          id: true,
          unit: {
            select: {
              id: true,
              nama: true,
            },
          },
          jabatan: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
  });
}

//----------------------------------------//
// -------- Update Nama Profile --------- //
//----------------------------------------//
export async function updateNamaUser(userId, name) {
  // validasi jika kosong
  if (!name || name.trim() === "") {
    throw new Error("INVALID_NAME");
  }

  return prisma.user.update({
    where: { id: Number(userId) },
    data: { name: name },
  });
}

//----------------------------------------//
// --------- Update Nik Profile --------- //
//----------------------------------------//
export async function updateNikUser(userId, nik) {
  console.log("Updating NIK:", nik);
  // validasi jika kosong
  if (!nik || nik.trim() === "") {
    throw new Error("INVALID_NIK");
  }

  // validasi jika terdapat bukan angka
  if (!/^\d+$/.test(nik)) {
    throw new Error("INVALID_NIK");
  }

  return prisma.user.update({
    where: { id: Number(userId) },
    data: { nik: Number(nik) },
  });
}

//----------------------------------------//
// --------Tambah Unit dan Jabatan ------ //
//----------------------------------------//
export async function tambahUnitJabatan(userId, selections) {
  if (!Array.isArray(selections) || selections.length === 0) {
    throw new Error("SELECTION_EMPTY");
  }

  return prisma.userUnitJabatan.createMany({
    data: selections.map((item) => ({
      userId,
      unitId: Number(item.unitId),
      jabatanId: Number(item.jabatanId),
    })),
  });
}

//----------------------------------------//
// ------- Hapus Unit dan Jabatan ------- //
//----------------------------------------//
export async function hapusUnitJabatan(userId, userUnitJabatanId) {
  const data = await prisma.userUnitJabatan.findFirst({
    where: {
      id: Number(userUnitJabatanId),
      userId,
    },
  });

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  return prisma.userUnitJabatan.delete({
    where: { id: Number(userUnitJabatanId) },
  });
}
