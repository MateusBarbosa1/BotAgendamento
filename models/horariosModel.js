const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getHorariosBruno(dia) {
    const horarios = await prisma.horariosBruno.findMany({ where: { diaSemana: dia } });
    return horarios;
}
async function getHorariosWallyson(dia) {
    const horarios = await prisma.horariosWallyson.findMany({ where: { diaSemana: dia } });
    return horarios;
}
module.exports = {
    getHorariosBruno,
    getHorariosWallyson,
}