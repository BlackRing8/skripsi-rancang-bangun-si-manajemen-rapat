import { prisma } from "@/lib/prisma";
import { encodeId } from "@/lib/secure-id";
import { decodeId } from "@/lib/secure-id";

export async function ambilListUser() {
  return prisma.userUnitJabatan.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          nik: true,
        },
      },
      unit: {
        select: {
          nama: true,
        },
      },
      jabatan: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: {
      unitId: "asc",
    },
  });
}

export async function ambilDataRapat(startTime, endTime) {
  return prisma.rapat.findMany({
    where: {
      tanggalMulai: {
        gte: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      tanggalMulai: "asc",
    },
    include: {
      notulen: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
}

export async function hapusUser(userId) {
  return prisma.$transaction(async (tx) => {
    // hapus relasi jabatan/unit
    await tx.userUnitJabatan.deleteMany({
      where: { userId: Number(userId) },
    });

    // hapus keikutsertaan rapat
    await tx.rapatPeserta.deleteMany({
      where: { userId: Number(userId) },
    });

    // hapus rapat yang dibuat user (cascade notulen aman)
    await tx.rapat.deleteMany({
      where: { pembuatId: Number(userId) },
    });

    // hapus user
    await tx.user.delete({
      where: { id: Number(userId) },
    });
  });
}

export async function tambahUser(payload) {
  const { email, name, nik, selections } = payload;
  // cek email sudah ada
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email User sudah terdaftar");
  }

  const userCreate = await prisma.user.create({
    data: {
      email: email,
      name: name,
      nik: Number(nik),
      profileCompleted: true,
    },
  });

  const userData = await prisma.user.findFirst({
    where: { email: email },
  });

  const userJabatan = await prisma.userUnitJabatan.createMany({
    data: selections.map((item) => ({
      userId: userData.id,
      unitId: Number(item.unitId),
      jabatanId: Number(item.jabatanId),
    })),
  });

  return userJabatan;
}

export async function ambilUserBaru() {
  const users = await prisma.user.findMany({
    where: {
      profileCompleted: false,
    },
    include: {
      unitJabatan: {
        include: {
          unit: true,
          jabatan: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return users.map((u) => ({
    secureId: encodeId(u.id),
    email: u.email,
    name: u.name,
    nik: u.nik,
    units: u.unitJabatan.length > 0 ? u.unitJabatan.map((uj) => uj.unit.nama) : [],
    jabatans: u.unitJabatan.length > 0 ? u.unitJabatan.map((uj) => uj.jabatan.nama) : [],
    createdAt: u.createdAt,
  }));
}

export async function validateUser(secureId) {
  const userId = decodeId(secureId);

  return prisma.user.update({
    where: { id: Number(userId) },
    data: {
      profileCompleted: true,
    },
  });
}
