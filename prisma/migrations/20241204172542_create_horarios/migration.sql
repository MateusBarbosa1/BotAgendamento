-- CreateTable
CREATE TABLE "Horarios" (
    "diaSemana" TEXT NOT NULL,
    "horarios" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "Horarios_diaSemana_key" ON "Horarios"("diaSemana");
