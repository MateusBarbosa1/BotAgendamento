/*
  Warnings:

  - A unique constraint covering the columns `[Barbeiro]` on the table `Agendamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Agendamentos_Barbeiro_key" ON "Agendamentos"("Barbeiro");
