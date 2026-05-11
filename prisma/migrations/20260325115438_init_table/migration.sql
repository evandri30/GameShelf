-- CreateEnum
CREATE TYPE "ShelfStatus" AS ENUM ('PLANNED', 'PLAYING', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelf" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawgId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "backgroundImage" TEXT,
    "status" "ShelfStatus" NOT NULL DEFAULT 'PLANNED',
    "rating" INTEGER,
    "caption" TEXT,
    "playtime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Shelf_userId_idx" ON "Shelf"("userId");

-- CreateIndex
CREATE INDEX "Shelf_slug_idx" ON "Shelf"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Shelf_userId_rawgId_key" ON "Shelf"("userId", "rawgId");

-- CreateIndex
CREATE UNIQUE INDEX "Shelf_userId_slug_key" ON "Shelf"("userId", "slug");

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
