-- DropIndex
DROP INDEX "Shelf_userId_idx";

-- CreateIndex
CREATE INDEX "Shelf_userId_status_idx" ON "Shelf"("userId", "status");
