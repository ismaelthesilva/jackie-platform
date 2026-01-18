-- DropForeignKey
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_createdById_fkey";

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "difficulty" TEXT;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
