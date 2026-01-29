import { prisma } from "@/lib/prisma";

export async function createRapatWithNotulen(payload) {
  const { judul, deskripsi, tanggalMulai, tanggalSelesai, lokasi, linkMeeting, pesertaAgenda, unitTujuanIds, pembuatId } = payload;

  // ===============================
  // 1️⃣ VALIDASI UNIT TUJUAN
  // ===============================
  if (!Array.isArray(unitTujuanIds) || unitTujuanIds.length === 0) {
    throw new Error("Unit tujuan wajib dipilih");
  }

  const unitConnect = unitTujuanIds.map((id) => ({ id }));

  // ===============================
  // 1️⃣ PREPARE DATA (DI LUAR TX)
  // ===============================

  let pesertaData = [];

  if (pesertaAgenda.length > 0) {
    const users = await prisma.user.findMany({
      where: { email: { in: pesertaAgenda } },
      select: { id: true },
    });

    pesertaData = users.map((u) => ({
      userId: u.id,
      status: "DIUNDANG",
    }));
  }

  // ===============================
  // 2️⃣ TRANSACTION (RINGKAS)
  // ===============================
  return prisma.$transaction(async (tx) => {
    // Buat rapat
    const rapat = await tx.rapat.create({
      data: {
        judul,
        deskripsi,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        lokasi,
        linkMeeting,
        pembuatId,
        pesertaEmails: pesertaAgenda.length ? pesertaAgenda : [],

        // 🔥 INI KUNCI UTAMA
        unitTujuan: {
          connect: unitConnect,
        },
      },
    });

    // Peserta rapat
    if (pesertaData.length > 0) {
      await tx.rapatPeserta.createMany({
        data: pesertaData.map((p) => ({
          rapatId: rapat.id,
          userId: p.userId,
          status: p.status,
        })),
        skipDuplicates: true,
      });
    }

    // Notulen
    await tx.notulen.create({
      data: {
        rapatId: rapat.id,
        dibuatOleh: pembuatId,
        jenisNotulen: "RAPAT_BIASA",
        status: "DRAFT",
      },
    });

    return rapat;
  });
}

export async function getMyAgenda(userId, email) {
  return prisma.rapat.findMany({
    where: {
      OR: [
        { pembuatId: userId },
        {
          peserta: {
            some: {
              user: { email: email },
            },
          },
        },
      ],
    },
    include: {
      notulen: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      tanggalMulai: "desc",
    },
  });
}

export async function getAllAgenda() {
  return prisma.rapat.findMany({
    include: {
      notulen: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      tanggalMulai: "desc",
    },
  });
}

export async function getDetailAgenda(rapatId) {
  return prisma.rapat.findUnique({
    where: { id: Number(rapatId) },
    include: {
      pembuat: true,
      peserta: {
        include: {
          user: true,
        },
      },
      notulen: true,
    },
  });
}

export async function updateAgendaById(payload) {
  const { id, judul, deskripsi, lokasi, tanggalMulai, tanggalSelesai, pesertaEmails } = payload;

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Update data rapat
    const rapat = await tx.rapat.update({
      where: { id: Number(id) },
      data: {
        judul,
        deskripsi,
        lokasi,
        tanggalMulai,
        tanggalSelesai,
        pesertaEmails,
      },
    });

    // 2️⃣ Ambil peserta lama
    const pesertaLama = await tx.rapatPeserta.findMany({
      where: { rapatId: rapat.id },
    });

    const pesertaLamaUserIds = pesertaLama.map((p) => p.userId);

    // 3️⃣ Cari user dari email
    const users = await tx.user.findMany({
      where: { email: { in: pesertaEmails } },
      select: { id: true },
    });

    const pesertaBaruUserIds = users.map((u) => u.id);

    // 4️⃣ HAPUS peserta yang tidak ada lagi
    const userIdsToRemove = pesertaLamaUserIds.filter((id) => !pesertaBaruUserIds.includes(id));

    if (userIdsToRemove.length > 0) {
      await tx.rapatPeserta.deleteMany({
        where: {
          rapatId: rapat.id,
          userId: { in: userIdsToRemove },
        },
      });
    }

    // 5️⃣ TAMBAH peserta baru
    const userIdsToAdd = pesertaBaruUserIds.filter((id) => !pesertaLamaUserIds.includes(id));

    if (userIdsToAdd.length > 0) {
      await tx.rapatPeserta.createMany({
        data: userIdsToAdd.map((userId) => ({
          rapatId: rapat.id,
          userId,
          status: "DIUNDANG",
        })),
      });
    }

    return rapat;
  });
}

export async function deleteAgendaById(id) {
  const rapatId = Number(id);

  const rapat = await prisma.rapat.findUnique({
    where: { id: rapatId },
  });

  // 2️⃣ Jika tidak ditemukan, langsung return null
  if (!rapat) {
    return null;
  }

  // 3️⃣ Hapus notulen terlebih dahulu
  await prisma.notulen.deleteMany({
    where: { rapatId: Number(rapat.id) },
  });

  // 4️⃣ Hapus rapat
  await prisma.rapat.delete({
    where: { id: Number(rapat.id) },
  });

  return rapat.id;
}

export async function absenPeserta(payload) {
  const { rapatId, pesertaId, status } = payload;
  // cek rapat ada atau tidak
  // console.log("data diterima service:", { rapatId, pesertaId, status });
  const rapat = await prisma.rapat.findFirst({
    where: { id: Number(rapatId) },
    include: {
      peserta: true,
    },
  });

  if (!rapat) {
    return Response.json({ status: 404 });
  }

  // cek peserta
  const cekPeserta = await prisma.rapatPeserta.findFirst({
    where: {
      rapatId: rapat.id,
      userId: pesertaId,
    },
  });

  if (!cekPeserta) {
    return Response.json({ status: 403 });
  }

  return await prisma.rapatPeserta.updateMany({
    where: { rapatId: rapat.id, userId: pesertaId },
    data: { status: status, waktuAbsen: new Date() },
  });
}

// SISTEM LAMA / SEBELUM REVISI

export async function updateAgendaByIdLama(payload) {
  const { id, judul, deskripsi, lokasi, tanggalMulai, tanggalSelesai } = payload;

  return prisma.rapat.update({
    where: { id: Number(id) },
    data: {
      judul: judul,
      deskripsi: deskripsi,
      lokasi: lokasi,
      tanggalMulai: tanggalMulai,
      tanggalSelesai: tanggalSelesai,
    },
  });
}
