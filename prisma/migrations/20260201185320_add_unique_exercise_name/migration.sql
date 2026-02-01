-- DropIndex
DROP INDEX "exercises_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");
