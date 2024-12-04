/*
  Warnings:

  - You are about to drop the column `Barbeiro` on the `Agendamentos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barbeiro]` on the table `Agendamentos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barbeiro` to the `Agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Agendamentos_Barbeiro_key";

-- AlterTable
ALTER TABLE "Agendamentos" DROP COLUMN "Barbeiro",
ADD COLUMN     "barbeiro" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Agendamentos_barbeiro_key" ON "Agendamentos"("barbeiro");
