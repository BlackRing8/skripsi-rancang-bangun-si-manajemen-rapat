-- CreateTable
CREATE TABLE `unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `unit_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jabatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NOT NULL,

    UNIQUE INDEX `jabatan_nama_unitId_key`(`nama`, `unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `nik` INTEGER NULL,
    `googleId` VARCHAR(191) NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `profileCompleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userunitjabatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `jabatanId` INTEGER NOT NULL,

    UNIQUE INDEX `userunitjabatan_userId_unitId_jabatanId_key`(`userId`, `unitId`, `jabatanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `tanggalMulai` DATETIME(3) NOT NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `lokasi` VARCHAR(191) NULL,
    `linkMeeting` VARCHAR(191) NULL,
    `pesertaEmails` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'BELUM_MULAI',
    `pembuatId` INTEGER NOT NULL,
    `dibuatPada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapatpeserta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapatId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DIUNDANG',
    `waktuAbsen` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notulen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapatId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `dibuatOleh` INTEGER NOT NULL,
    `dibuatPada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notulen_rapatId_key`(`rapatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RapatUnit` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RapatUnit_AB_unique`(`A`, `B`),
    INDEX `_RapatUnit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jabatan` ADD CONSTRAINT `jabatan_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userunitjabatan` ADD CONSTRAINT `userunitjabatan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userunitjabatan` ADD CONSTRAINT `userunitjabatan_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userunitjabatan` ADD CONSTRAINT `userunitjabatan_jabatanId_fkey` FOREIGN KEY (`jabatanId`) REFERENCES `jabatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapat` ADD CONSTRAINT `rapat_pembuatId_fkey` FOREIGN KEY (`pembuatId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapatpeserta` ADD CONSTRAINT `rapatpeserta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapatpeserta` ADD CONSTRAINT `rapatpeserta_rapatId_fkey` FOREIGN KEY (`rapatId`) REFERENCES `rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notulen` ADD CONSTRAINT `notulen_rapatId_fkey` FOREIGN KEY (`rapatId`) REFERENCES `rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RapatUnit` ADD CONSTRAINT `_RapatUnit_A_fkey` FOREIGN KEY (`A`) REFERENCES `rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RapatUnit` ADD CONSTRAINT `_RapatUnit_B_fkey` FOREIGN KEY (`B`) REFERENCES `unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
