/*
  Warnings:

  - You are about to drop the column `slug` on the `posts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `posts_slug_key` ON `posts`;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `slug`;
