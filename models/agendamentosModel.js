const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAgendamentos(date, barber) {
    const agendamento = await prisma.agendamentos.findMany({ where: { barbeiro: barber, date: new Date(date) } });
    return agendamento;
}
async function getAgendamentosNumber(number) {
    const agendamentos = await prisma.agendamentos.findMany({ where: { numero: number } });
    return agendamentos;
}
async function setAgendamentos(barber, data,hora,nome, numero, horario_agendamento) {
    await prisma.agendamentos.create({
        data: {
            barbeiro: barber,
            date: data,
            time: hora,
            name: nome,
            numero: numero,
            horarioAgendamento: horario_agendamento
        }
    });
}

module.exports = {
    getAgendamentos,
    setAgendamentos,
    getAgendamentosNumber
}