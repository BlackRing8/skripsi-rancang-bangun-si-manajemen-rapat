import { prisma } from "@/lib/prisma";

export async function ambilDraftNotulen(notulenId) {
  return prisma.notulen.findFirst({
    where: { id: Number(notulenId) },
    include: {
      keputusan: true,
      rapat: {
        include: {
          pembuat: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function finalisasiNotulen(payload) {
  const { notulenId, pembuatId, keputusan } = payload;

  console.log(notulenId);

  // 1. Validasi notulen & hak akses
  const notulen = await prisma.notulen.findFirst({
    where: {
      id: Number(notulenId),
      // dibuatOleh: Number(pembuatId),
      status: { not: "DIKUNCI" }, // tidak boleh edit jika sudah dikunci
    },
  });

  if (!notulen) {
    throw new Error("Notulen tidak ditemukan atau sudah dikunci");
  }

  // 2. Transaksi (AMAN)
  return prisma.$transaction(async (tx) => {
    // 2a. Hapus keputusan lama
    await tx.notulenKeputusan.deleteMany({
      where: { notulenId: Number(notulenId) },
    });

    // 2b. Simpan keputusan baru
    await tx.notulenKeputusan.createMany({
      data: keputusan.map((k) => ({
        notulenId: Number(notulenId),
        keputusan: k.keputusan,
        penanggungJawab: k.penanggungJawab || null,
        tenggatWaktu: k.tenggatWaktu ? new Date(k.tenggatWaktu) : null,
      })),
    });

    await tx.rapat.update({
      where: { id: Number(notulen.rapatId) },
      data: {
        status: "SELESAI",
      },
    });

    // 2c. Kunci notulen
    await tx.notulen.update({
      where: { id: Number(notulenId) },
      data: {
        status: "DIKUNCI",
        dikunciPada: new Date(),
      },
    });

    // 2d. Return data terbaru
    return tx.notulen.findUnique({
      where: { id: Number(notulenId) },
      include: { keputusan: true },
    });
  });
}
