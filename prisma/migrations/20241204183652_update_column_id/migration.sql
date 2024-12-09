/*
  Warnings:

  - The primary key for the `Agendamentos` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Agendamentos" DROP CONSTRAINT "Agendamentos_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Agendamentos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Agendamentos_id_seq";
