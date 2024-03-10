/*
  Warnings:

  - You are about to drop the column `patronId` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `librarianId` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `patronId` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the `Librarian` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patron` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogType" ADD VALUE 'ADD_LIBRARIAN';
ALTER TYPE "LogType" ADD VALUE 'CHANGE_LIBRARIAN';
ALTER TYPE "LogType" ADD VALUE 'ADD_ADMIN';
ALTER TYPE "LogType" ADD VALUE 'CHANGE_ADMIN';

-- DropForeignKey
ALTER TABLE "Checkout" DROP CONSTRAINT "Checkout_patronId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_librarianId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_patronId_fkey";

-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "patronId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "librarianId",
DROP COLUMN "patronId",
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "Librarian";

-- DropTable
DROP TABLE "Patron";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "isLibrarian" BOOLEAN NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginName" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "preferredName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginName_key" ON "User"("loginName");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
