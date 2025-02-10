/*
  Warnings:

  - You are about to drop the column `createdById` on the `Class` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_createdById_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
