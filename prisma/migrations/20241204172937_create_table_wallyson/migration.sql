/*
  Warnings:

  - You are about to drop the `Horarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Horarios";

-- CreateTable
CREATE TABLE "HorariosBruno" (
    "diaSemana" TEXT NOT NULL,
    "horarios" TEXT[]
);

-- CreateTable
CREATE TABLE "HorariosWallyson" (
    "diaSemana" TEXT NOT NULL,
    "horarios" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "HorariosBruno_diaSemana_key" ON "HorariosBruno"("diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "HorariosWallyson_diaSemana_key" ON "HorariosWallyson"("diaSemana");
