const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAgendamentos(date, barber) {
    try {
        const agendamento = await prisma.agendamentos.findMany({ where: { barbeiro: barber, date: new Date(date) } });
        return agendamento;
    } catch(err) {
        console.error('Houve algum erro: '+ err);
    }
    
}
async function getAgendamentosNumber(number) {
    const agendamentos = await prisma.agendamentos.findMany({ where: { numero: number } });
    return agendamentos;
}
async function setAgendamentos(servico,barber, data,hora,nome, numero, horario_agendamento) {
    const agendamento = await prisma.agendamentos.create({
        data: {
            servico: servico,
            barbeiro: barber,
            date: data,
            time: hora,
            name: nome,
            numero: numero,
            horarioAgendamento: horario_agendamento
        }
    });
    return agendamento;
}
async function deleteAgendamentoID(id) {
    const agendamentos = await prisma.agendamentos.delete({ where: { id: id } });
    return agendamentos;
}
module.exports = {
    getAgendamentos,
    setAgendamentos,
    getAgendamentosNumber,
    deleteAgendamentoID
}