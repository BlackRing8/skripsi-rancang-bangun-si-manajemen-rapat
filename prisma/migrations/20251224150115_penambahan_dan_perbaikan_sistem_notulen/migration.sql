/*
  Warnings:

  - You are about to drop the column `fileId` on the `notulen` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `notulen` table. All the data in the column will be lost.
  - Added the required column `diperbaruiPada` to the `notulen` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notulen` DROP FOREIGN KEY `notulen_rapatId_fkey`;

-- AlterTable
ALTER TABLE `notulen` DROP COLUMN `fileId`,
    DROP COLUMN `fileUrl`,
    ADD COLUMN `dikunciPada` DATETIME(3) NULL,
    ADD COLUMN `diperbaruiPada` DATETIME(3) NOT NULL,
    ADD COLUMN `jenisNotulen` VARCHAR(191) NOT NULL DEFAULT 'RAPAT_BIASA',
    ADD COLUMN `pembukaan` TEXT NULL,
    ADD COLUMN `penutup` TEXT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE `notulen_pembahasan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notulenId` INTEGER NOT NULL,
    `judulAgenda` VARCHAR(191) NOT NULL,
    `pembahasan` TEXT NULL,
    `kesimpulan` TEXT NULL,
    `urutan` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notulen_keputusan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notulenId` INTEGER NOT NULL,
    `keputusan` TEXT NOT NULL,
    `penanggungJawab` VARCHAR(191) NULL,
    `tenggatWaktu` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notulen` ADD CONSTRAINT `notulen_rapatId_fkey` FOREIGN KEY (`rapatId`) REFERENCES `rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notulen_pembahasan` ADD CONSTRAINT `notulen_pembahasan_notulenId_fkey` FOREIGN KEY (`notulenId`) REFERENCES `notulen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notulen_keputusan` ADD CONSTRAINT `notulen_keputusan_notulenId_fkey` FOREIGN KEY (`notulenId`) REFERENCES `notulen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
