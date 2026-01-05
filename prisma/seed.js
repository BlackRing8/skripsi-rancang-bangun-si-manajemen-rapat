import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📋 DAFTAR USER PER UNIT & JABATAN\n");

  const data = await prisma.unit.findMany({
    include: {
      userUnitJabatan: {
        include: {
          user: true,
          jabatan: true,
        },
      },
    },
    orderBy: {
      nama: "asc",
    },
  });

  if (data.length === 0) {
    console.log("⚠️ Tidak ada data unit.");
    return;
  }

  for (const unit of data) {
    console.log(`🏢 Unit: ${unit.nama}`);

    if (unit.userUnitJabatan.length === 0) {
      console.log("   └─ (Belum ada user)\n");
      continue;
    }

    // Grouping by jabatan
    const grouped = {};

    for (const uj of unit.userUnitJabatan) {
      const jabatan = uj.jabatan.nama;

      if (!grouped[jabatan]) {
        grouped[jabatan] = [];
      }

      grouped[jabatan].push(uj.user);
    }

    for (const jabatan in grouped) {
      console.log(`   👔 Jabatan: ${jabatan}`);

      grouped[jabatan].forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.name ?? "(Tanpa Nama)"} — ${user.email}`);
      });
    }

    console.log(""); // spasi antar unit
  }

  console.log("✅ Selesai menampilkan data");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
