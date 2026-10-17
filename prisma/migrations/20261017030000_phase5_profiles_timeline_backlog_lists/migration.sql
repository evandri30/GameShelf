-- AlterTable
ALTER TABLE "Shelf" ADD COLUMN     "backlogPosition" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" TEXT;

-- Backfill usernames for existing users: email local part (a-z0-9, max 14 chars) + short hash of the id
UPDATE "User"
SET "username" = COALESCE(NULLIF(LEFT(LOWER(REGEXP_REPLACE(SPLIT_PART("email", '@', 1), '[^a-zA-Z0-9]', '', 'g')), 14), ''), 'player')
    || '-' || SUBSTR(MD5("id"), 1, 5);

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Backfill timeline dates with the best available approximation
UPDATE "Shelf" SET "completedAt" = "updatedAt" WHERE "status" = 'COMPLETED';
UPDATE "Shelf" SET "startedAt" = "createdAt" WHERE "status" IN ('PLAYING', 'COMPLETED');

-- Backlog order for existing planned games: oldest first
UPDATE "Shelf" s
SET "backlogPosition" = ranked.pos
FROM (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") AS pos
    FROM "Shelf"
    WHERE "status" = 'PLANNED'
) ranked
WHERE s."id" = ranked."id";

-- CreateTable
CREATE TABLE "ShelfList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelfList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShelfListItem" (
    "listId" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShelfListItem_pkey" PRIMARY KEY ("listId","shelfId")
);

-- CreateIndex
CREATE INDEX "ShelfList_userId_idx" ON "ShelfList"("userId");

-- CreateIndex
CREATE INDEX "ShelfListItem_shelfId_idx" ON "ShelfListItem"("shelfId");

-- CreateIndex
CREATE INDEX "Shelf_userId_completedAt_idx" ON "Shelf"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "ShelfList" ADD CONSTRAINT "ShelfList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfListItem" ADD CONSTRAINT "ShelfListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShelfList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfListItem" ADD CONSTRAINT "ShelfListItem_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

