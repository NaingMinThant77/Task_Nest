/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `role` DROP COLUMN `profilePhoto`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `profilePhoto` VARCHAR(255) NULL;
