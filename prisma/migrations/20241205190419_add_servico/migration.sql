/*
  Warnings:

  - Added the required column `servico` to the `Agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agendamentos" ADD COLUMN     "servico" TEXT NOT NULL;
