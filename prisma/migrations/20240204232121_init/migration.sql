-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CHECK_OUT', 'CHECK_IN', 'CHECKOUT_UNKNOWN', 'CHECKIN_UNKNOWN', 'ADD_ITEM', 'CHANGE_ITEM', 'ADD_PATRON', 'CHANGE_PATRON');

-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('ISBN10', 'ISBN13', 'UPC', 'IN_HOUSE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('BOOK', 'MAGAZINE', 'CD_OR_DVD', 'GAME');

-- CreateTable
CREATE TABLE "Patron" (
    "id" SERIAL NOT NULL,
    "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "preferredName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "Patron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Librarian" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "Librarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    "type" "LogType" NOT NULL,
    "librarianId" INTEGER,
    "itemId" INTEGER,
    "patronId" INTEGER,
    "checkoutId" INTEGER,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "type" "ItemType" NOT NULL,
    "partitionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "publishedYear" INTEGER,
    "metadataUnreviewed" BOOLEAN NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "patronId" INTEGER NOT NULL,
    "outTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" SERIAL NOT NULL,
    "type" "CodeType" NOT NULL,
    "content" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "urlName" TEXT NOT NULL,
    "friendlyName" TEXT NOT NULL,
    "friendlyLocation" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partition" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER,

    CONSTRAINT "Partition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthorToItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Patron_loginName_key" ON "Patron"("loginName");

-- CreateIndex
CREATE UNIQUE INDEX "Librarian_fullName_key" ON "Librarian"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Code_content_key" ON "Code"("content");

-- CreateIndex
CREATE UNIQUE INDEX "Section_urlName_key" ON "Section"("urlName");

-- CreateIndex
CREATE UNIQUE INDEX "Section_friendlyName_key" ON "Section"("friendlyName");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToItem_AB_unique" ON "_AuthorToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToItem_B_index" ON "_AuthorToItem"("B");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "Librarian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_patronId_fkey" FOREIGN KEY ("patronId") REFERENCES "Patron"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_partitionId_fkey" FOREIGN KEY ("partitionId") REFERENCES "Partition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_patronId_fkey" FOREIGN KEY ("patronId") REFERENCES "Patron"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partition" ADD CONSTRAINT "Partition_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToItem" ADD CONSTRAINT "_AuthorToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToItem" ADD CONSTRAINT "_AuthorToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
