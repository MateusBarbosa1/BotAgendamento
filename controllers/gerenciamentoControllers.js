const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');

const authDirectory = path.join(__dirname, 'wwebjs_auth');

let sock = null;

// fila para mensagens que chegam antes do socket estar pronto
const pendingMessages = [];

// flag / promise para saber quando está conectado
let isConnected = false;
let resolveConnected;
const connectedPromise = new Promise(resolve => { resolveConnected = resolve; });

async function startBot() {
    // pega a versão (compatibilidade de protocolo)
    const versionInfo = await fetchLatestBaileysVersion();
    // suporta retorno em array ou objeto (fallback seguro)
    const version = Array.isArray(versionInfo) ? versionInfo[0] : (versionInfo?.version ?? undefined);

    const { state, saveCreds } = await useMultiFileAuthState(authDirectory);

    sock = makeWASocket({
        version, // importantíssimo para compatibilidade
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04'],
        printQRInTerminal: true,
        markOnlineOnConnect: false
    });

    sock.ev.on('connection.update', async (update) => {
        console.log('connection.update:', update); // DEBUG: imprime tudo pra inspeção
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            console.log('BARBOSA DEV - Escaneie o QR:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            isConnected = true;
            console.log('Conectado com sucesso! sock.user:', sock.user ?? '<sem sock.user>');
            resolveConnected(true);

            // flush fila
            while (pendingMessages.length > 0) {
                const item = pendingMessages.shift();
                try {
                    console.log('Flushing queued message para', item.jid);
                    const result = await sock.sendMessage(item.jid, { text: item.message });
                    console.log('Queued message enviada:', item.jid, result);
                    item.resolve(result);
                } catch (err) {
                    console.error('Erro ao enviar queued message para', item.jid, err);
                    item.reject(err);
                }
            }
        }

        if (connection === 'close') {
            isConnected = false;
            console.log('Conexão fechada:', lastDisconnect?.error ?? lastDisconnect);
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
            if (shouldReconnect) {
                console.log('Tentando reconectar...');
                startBot();
            } else {
                console.log('Não reconectar (401).');
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

function normalizeToJid(number) {
    if (!number) return null;
    if (typeof number !== 'string' && typeof number !== 'number') return null;

    let s = String(number).trim();

    // se já tem @, assume que é jid
    if (s.includes('@')) return s;

    // retira tudo que não é dígito
    const digits = s.replace(/\D/g, '');
    if (!digits) return null;

    // se não tem código do país, tenta colocar 55 (BR) como fallback
    // ajuste esse comportamento se seus números do BD já contêm country code
    const withCountry = digits.length <= 11 ? '55' + digits : digits;

    return `${withCountry}@s.whatsapp.net`;
}

async function sendMessage(number, message) {
    try {
        const jid = normalizeToJid(number);
        if (!jid) {
            console.error('sendMessage: número inválido, pulando envio:', number);
            return null;
        }

        // se não estiver conectado, enfileira e retorna uma Promise que será resolvida ao enviar
        if (!isConnected || !sock) {
            console.log('sendMessage: socket não pronto, enfileirando para', jid);
            return new Promise((resolve, reject) => {
                pendingMessages.push({ jid, message, resolve, reject });
            });
        }

        // caso esteja conectado:
        const result = await sock.sendMessage(jid, { text: message });
        console.log('sendMessage: enviado', jid, result);
        return result;
    } catch (error) {
        // imprime o objeto inteiro pra ver stack/detalhes
        console.error('sendMessage: erro completo:', error);
        throw error; // re-lança pra o chamador poder tratar
    }
}

// inicia
startBot();

module.exports.renderGerenciamento =function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        if(jwtDecode(token).user == "BrunoAdmin") {
            res.render('gerenciamento/index');
        } else {
            res.redirect('/');
        }
    }
}
module.exports.renderGerenciamentoWallyson = function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        if(jwtDecode(token).user == "BrunoAdmin") {
            res.render('gerenciamento/wallyson');
        } else {
            res.redirect('/');
        }
    }
}
module.exports.renderGerenciamentoBruno = function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        if(jwtDecode(token).user == "BrunoAdmin") {
            res.render('gerenciamento/bruno');
        } else {
            res.redirect('/');
        }
    }
}
module.exports.renderGerenciamentoAgendamentosBruno = async function(app,req,res) {
    res.render('gerenciamento/agendamentosBruno', {agendamentos: '', date: ''});
}
module.exports.renderGerenciamentoDataHoraBruno = function(app,req,res) {
    res.render('gerenciamento/dataHoraBruno', {horarios: false, date: ''});
}
module.exports.renderGerenciamentoHorariosBruno = function(app,req,res) {
    res.render('gerenciamento/horariosBruno', {horarios: false});
}
module.exports.renderGerenciamentoAgendamentosWallyson = function(app,req,res) {
    res.render('gerenciamento/agendamentosWallyson', {agendamentos: '', date: ''});
}
module.exports.renderGerenciamentoDataHoraWallyson = function(app,req,res) {
    res.render('gerenciamento/dataHoraWallyson', {horarios: false, date: ''});
}
module.exports.renderGerenciamentoHorariosWallyson = function(app,req,res) {
    res.render('gerenciamento/horariosWallyson', {horarios: false});
}
module.exports.searchDateBruno = async function(app,req,res) {
    const agendamentosModel = require('../models/agendamentosModel');
    
    const agendamentos = await agendamentosModel.getAgendamentos(new Date(req.body.date), "Bruno");
    res.render("gerenciamento/agendamentosBruno", {agendamentos: agendamentos})
}
module.exports.searchDateWallyson = async function(app,req,res) {
    const agendamentosModel = require('../models/agendamentosModel');
    
    const agendamentos = await agendamentosModel.getAgendamentos(new Date(req.body.date), "Wallyson");
    res.render("gerenciamento/agendamentosBruno", {agendamentos: agendamentos})
}
module.exports.gerenciarDataHoraBruno = async function(app,req,res) {
    const data = req.body;

    const dias = ["Domingo","Segunda","Terca","Quarta","Quinta","Sexta","Sabado"]

    const horariosModel = require('../models/horariosModel');
    const horarios = await horariosModel.getHorariosBruno(dias[new Date(data.date).getDay()]);

    res.render('gerenciamento/dataHoraBruno', {horarios: horarios, date: data.date})
}
module.exports.gerenciarDataHoraWallyson = async function(app,req,res) {
    const data = req.body;

    const dias = ["Domingo","Segunda","Terca","Quarta","Quinta","Sexta","Sabado"]

    const horariosModel = require('../models/horariosModel');
    const horarios = await horariosModel.getHorariosWallyson(dias[new Date(data.date).getDay()]);

    res.render('gerenciamento/dataHoraWallyson', {horarios: horarios, date: data.date})
}
module.exports.deletarDataHoraBruno = async function(app,req,res) {
    const data = req.body;
    const agendamentosModel = require('../models/agendamentosModel');

    if(Array.isArray(data.selectedHorarios)) {
        for(let i = 0;i < data.selectedHorarios.length;i++) {
            await agendamentosModel.setAgendamentos("","Bruno",new Date(data.date).toISOString(),data.selectedHorarios[i],"Indisponivel","Indisponivel",new Date());
        }
    } else {
        await agendamentosModel.setAgendamentos("","Bruno",new Date(data.date).toISOString(),data.selectedHorarios,"Indisponivel","Indisponivel",new Date());
    }
    res.redirect('/gerenciar/bruno/data_hora');
    
}
module.exports.deletarDataHoraWallyson = async function(app,req,res) {
    const data = req.body;
    const agendamentosModel = require('../models/agendamentosModel');
    
    if(Array.isArray(data.selectedHorarios)) {
        for(let i = 0;i < data.selectedHorarios.length;i++) {
            await agendamentosModel.setAgendamentos("","Wallyson",new Date(data.date).toISOString(),data.selectedHorarios[i],"Indisponivel","Indisponivel",new Date());
        }
    } else {
        await agendamentosModel.setAgendamentos("","Wallyson",new Date(data.date).toISOString(),data.selectedHorarios,"Indisponivel","Indisponivel",new Date());
    }
    res.redirect('/gerenciar/wallyson/data_hora')
}
module.exports.deleteAgendamento = async function(app,req,res,barber) {
    const axios = require('axios');
    const data = req.body;

    const agendamentosModel = require('../models/agendamentosModel');

    if(Array.isArray(data.selectedAgendamentos)) {
        for(let i = 0;i < data.selectedAgendamentos.length;i++) {
            const agendamento = await agendamentosModel.deleteAgendamentoID(data.selectedAgendamentos[i]);
            const date = new Date(agendamento.date);
            if(agendamento.numero != "local") {
                await sendMessage(agendamento.numero, "⚠️ Seu agendamento foi cancelado pelo Barbeiro!")
            }
        }
    } else {
        const agendamento = await agendamentosModel.deleteAgendamentoID(data.selectedAgendamentos); 
        const date = new Date(agendamento.date);
        if(agendamento.numero != "local") {
            await sendMessage(agendamento.numero, "⚠️ Seu agendamento foi cancelado pelo Barbeiro!")
        }
    }
    
    if(barber == "b") {
        res.redirect('/gerenciar/bruno/agendamentos');
    } else {
        res.redirect('/gerenciar/wallyson/agendamentos');
    }
}
module.exports.getHorariosBruno = async function(app,req,res) {
    const data = req.body;

    const horariosModel = require('../models/horariosModel');
    const horarios = await horariosModel.getHorariosBruno(data.diaSemana);

    res.render('gerenciamento/horariosBruno', {horarios: horarios});
}
module.exports.getHorariosWallyson = async function(app,req,res) {
    const data = req.body;

    const horariosModel = require('../models/horariosModel');
    const horarios = await horariosModel.getHorariosWallyson(data.diaSemana);

    res.render('gerenciamento/horariosWallyson', {horarios: horarios});
}
module.exports.updateHorariosBruno = async function(app,req,res) {
    const data = req.body;

    const horariosModel = require('../models/horariosModel');
    await horariosModel.updateHorariosBruno(data.horario_antigo,data.horario_novo,data.diaSemana);

    res.redirect('/gerenciar/bruno/horarios');
}
module.exports.addHorarioBruno = async function(app,req,res) {
    const data = req.body;
    const horariosModel = require('../models/horariosModel');
    await horariosModel.addHorarioBruno(data.horario_referencia,data.horario_novo, data.diaSemana);
    res.redirect('/gerenciar/bruno/horarios');
}
module.exports.deleteHorarioBruno = async function deleteHorarioBruno(app,req,res) {
    const data = req.body;
    const horariosModel = require('../models/horariosModel');
    await horariosModel.deleteHorarioBruno(data);   
    res.redirect('/gerenciar/bruno/horarios');
}
module.exports.updateHorariosWallyson = async function(app,req,res) {
    const data = req.body;

    const horariosModel = require('../models/horariosModel');
    await horariosModel.updateHorariosWallyson(data.horario_antigo,data.horario_novo,data.diaSemana);

    res.redirect('/gerenciar/wallyson/horarios');
}
module.exports.addHorarioWallyson = async function(app,req,res) {
    const data = req.body;
    const horariosModel = require('../models/horariosModel');
    await horariosModel.addHorarioWallyson(data.horario_referencia,data.horario_novo, data.diaSemana);
    res.redirect('/gerenciar/wallyson/horarios');
}
module.exports.deleteHorarioWallyson = async function deleteHorarioWallyson(app,req,res) {
    const data = req.body;
    const horariosModel = require('../models/horariosModel');
    await horariosModel.deleteHorarioWallyson(data);   
    res.redirect('/gerenciar/wallyson/horarios');
}
module.exports.renderCreateAgendamentoBruno = async function(app,req,res) {
    const init_query = req.query;
    if(Object.values(init_query).length === 0) {
        res.render('gerenciamento/createAgendamentoBruno', {init_query: false, horarios: false});        
    } else {
        const agendamentosModel = require('../models/agendamentosModel');
        const dias = ["Segunda","Terca","Quarta","Quinta","Sexta","Sabado"];
        const horariosModel = require("../models/horariosModel");
        const horarios = await horariosModel.getHorariosBruno(dias[new Date(init_query.date).getDay()-1]);
        const agendamentos = await agendamentosModel.getAgendamentos(new Date(init_query.date), init_query.barbeiro);
        let horariosIndisponiveis = [];
        let horariosDisponiveis = [];
        for (let i = 0;i < agendamentos.length;i++) {
            horariosIndisponiveis.push(agendamentos[i].time);
        }

        horariosDisponiveis = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
        res.render('gerenciamento/createAgendamentoBruno', {init_query: init_query, horarios: horariosDisponiveis})
    }
}
module.exports.createAgendamentoBruno = async function(app,req,res) {
    const data = req.body;

    const agendamentosModel = require('../models/agendamentosModel');
    await agendamentosModel.setAgendamentos(data.servico,data.barbeiro,new Date(data.date),data.horario,data.name,'local',new Date());
    res.redirect('/gerenciar/bruno/create_agendamento');
}
module.exports.renderCreateAgendamentoWallyson = async function(app,req,res) {
    const init_query = req.query;
    if(Object.values(init_query).length === 0) {
        res.render('gerenciamento/createAgendamentoWallyson', {init_query: false, horarios: false});        
    } else {
        const agendamentosModel = require('../models/agendamentosModel');
        const dias = ["Segunda","Terca","Quarta","Quinta","Sexta","Sabado"];
        const horariosModel = require("../models/horariosModel");
        const horarios = await horariosModel.getHorariosWallyson(dias[new Date(init_query.date).getDay()-1]);
        const agendamentos = await agendamentosModel.getAgendamentos(new Date(init_query.date), init_query.barbeiro);
        let horariosIndisponiveis = [];
        let horariosDisponiveis = [];
        for (let i = 0;i < agendamentos.length;i++) {
            horariosIndisponiveis.push(agendamentos[i].time);
        }

        horariosDisponiveis = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
        res.render('gerenciamento/createAgendamentoWallyson', {init_query: init_query, horarios: horariosDisponiveis})
    }
}
module.exports.createAgendamentoWallyson = async function(app,req,res) {
    const data = req.body;

    const agendamentosModel = require('../models/agendamentosModel');
    await agendamentosModel.setAgendamentos(data.servico,data.barbeiro,new Date(data.date),data.horario,data.name,'local',new Date());
    res.redirect('/gerenciar/wallyson/create_agendamento');
}