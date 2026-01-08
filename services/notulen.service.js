import { prisma } from "@/lib/prisma";

export async function ambilDraftNotulen(notulenId) {
  return prisma.notulen.findFirst({
    where: { id: Number(notulenId) },
    include: {
      pembahasan: true,
      keputusan: true,
      rapat: {
        include: {
          pembuat: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function simpanDraftNotulen(payload) {
  const { notulenId, pembukaan, penutup, pembahasan, pembuatId } = payload;

  if (!Array.isArray(pembahasan)) {
    throw new Error({ message: "Format pembahasan tidak valid" }, { status: 400 });
  }

  // pastikan notulen ada & milik user
  const notulen = await prisma.notulen.findFirst({
    where: {
      id: Number(notulenId),
      dibuatOleh: Number(pembuatId),
      status: "DRAFT",
    },
  });

  if (!notulen) {
    throw new Error({ message: "Notulen tidak ditemukan atau tidak dapat diedit" }, { status: 403 });
  }

  // TRANSACTION
  return prisma.$transaction(async (tx) => {
    // update notulen utama
    await tx.notulen.update({
      where: { id: Number(notulenId) },
      data: {
        pembukaan,
        penutup,
        status: "FINAL", // kunci status notulen ke Final
      },
    });

    // hapus pembahasan lama
    await tx.notulenPembahasan.deleteMany({
      where: { notulenId: Number(notulenId) },
    });

    // insert pembahasan baru
    if (pembahasan.length > 0) {
      await tx.notulenPembahasan.createMany({
        data: pembahasan.map((item, index) => ({
          notulenId: Number(notulenId),
          judulAgenda: item.judulAgenda ?? "",
          pembahasan: item.pembahasan || null,
          kesimpulan: item.kesimpulan || null,
          urutan: item.urutan ?? index + 1,
        })),
      });
    }

    // ambil ulang notulen lengkap
    return tx.notulen.findUnique({
      where: { id: Number(notulenId) },
      include: {
        pembahasan: {
          orderBy: { urutan: "asc" },
        },
        keputusan: true,
      },
    });
  });
}

export async function simpanKeputusanNotulen(payload) {
  const { notulenId, keputusan, pembuatId } = payload;

  if (!Array.isArray(keputusan)) {
    throw new Error("Format keputusan tidak valid");
  }

  const notulen = await prisma.notulen.findFirst({
    where: {
      id: Number(notulenId),
      dibuatOleh: Number(pembuatId),
      // status: { in: ["DRAFT", "FINAL"] },
    },
  });

  if (!notulen) {
    throw new Error("Notulen tidak ditemukan atau tidak dapat diedit");
  }
  await prisma.$transaction(async (tx) => {
    await tx.notulenKeputusan.deleteMany({
      where: { notulenId: Number(notulenId) },
    });

    if (keputusan.length > 0) {
      await tx.notulenKeputusan.createMany({
        data: keputusan.map((item) => ({
          notulenId: Number(notulenId),
          keputusan: item.keputusan,
          penanggungJawab: item.penanggungJawab || null,
          tenggatWaktu: item.tenggatWaktu ? new Date(item.tenggatWaktu) : null,
        })),
      });
    }
  });

  return true;
}

export async function finalisasiNotulen(payload) {
  const { notulenId, pembuatId } = payload;

  const notulen = await prisma.notulen.findFirst({
    where: {
      id: Number(notulenId),
      dibuatOleh: Number(pembuatId),
      status: "FINAL",
    },
    include: {
      keputusan: true,
    },
  });

  if (!notulen) {
    throw new Error("Notulen tidak ditemukan atau belum siap difinalisasi");
  }

  if (notulen.keputusan.length === 0) {
    throw new Error("Minimal satu keputusan harus diisi sebelum finalisasi");
  }

  return prisma.notulen.update({
    where: { id: Number(notulenId) },
    data: {
      status: "DIKUNCI",
      dikunciPada: new Date(),
    },
  });
}
