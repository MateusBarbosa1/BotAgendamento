/*
  Warnings:

  - Added the required column `horarioAgendamento` to the `Agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agendamentos" ADD COLUMN     "horarioAgendamento" TIMESTAMP(3) NOT NULL;
