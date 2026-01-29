import { prisma } from "@/lib/prisma";

export async function ambilCardAgenda(userId) {
  const now = new Date();

  // console.log("data diterima service:", userId);

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return prisma.rapat.findMany({
    where: {
      tanggalMulai: {
        gte: startOfDay,
        lte: endOfDay,
      },
      OR: [
        // Rapat yang dibuat user
        { pembuatId: userId },

        // Rapat yang user jadi peserta
        {
          peserta: {
            some: {
              userId: userId,
            },
          },
        },
      ],
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

export async function ambilCardAgendaAdmin() {
  const now = new Date();

  // console.log("data diterima service:", userId);

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return prisma.rapat.findMany({
    where: {
      tanggalMulai: {
        gte: startOfDay,
        lte: endOfDay,
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

export async function ambilDataCalendar(userId, startTime, endTime) {
  return prisma.rapat.findMany({
    where: {
      tanggalMulai: {
        gte: startTime,
        lte: endTime,
      },
      OR: [
        { pembuatId: userId },
        {
          peserta: {
            some: {
              userId: userId,
            },
          },
        },
      ],
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
