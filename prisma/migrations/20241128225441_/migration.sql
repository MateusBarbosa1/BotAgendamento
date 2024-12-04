/*
  Warnings:

  - Added the required column `name` to the `Agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agendamentos" ADD COLUMN     "name" TEXT NOT NULL;
