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
module.exports.renderGerenciamentoAgendamentosBruno = function(app,req,res) {
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
    
    const agendamentos = await agendamentosModel.getAgendamentos(req.body.date, "Bruno");
    res.render("gerenciamento/agendamentosBruno", {agendamentos: agendamentos})
}
module.exports.searchDateWallyson = async function(app,req,res) {
    const agendamentosModel = require('../models/agendamentosModel');
    
    const agendamentos = await agendamentosModel.getAgendamentos(req.body.date, "Wallyson");
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
    for(let i = 0;i < data.selectedHorarios.length;i++) {
        await agendamentosModel.setAgendamentos("","Bruno",new Date(data.date).toISOString(),data.selectedHorarios[i],"Indisponivel","Indisponivel",new Date());
    }
    res.redirect('/gerenciar/bruno/data_hora')
}
module.exports.deletarDataHoraWallyson = async function(app,req,res) {
    const data = req.body;

    const agendamentosModel = require('../models/agendamentosModel');
    for(let i = 0;i < data.selectedHorarios.length;i++) {
        await agendamentosModel.setAgendamentos("","Wallyson",new Date(data.date).toISOString(),data.selectedHorarios[i],"Indisponivel","Indisponivel",new Date());
    }
    res.redirect('/gerenciar/wallyson/data_hora')
}
module.exports.deleteAgendamento = async function(app,req,res,barber) {
    const data = req.body;

    const agendamentosModel = require('../models/agendamentosModel');
    if(Array.isArray(data.selectedAgendamentos)) {
        for(let i = 0;i < data.selectedAgendamentos.length;i++) {
            console.log(data.selectedAgendamentos[i])
            await agendamentosModel.deleteAgendamentoID(data.selectedAgendamentos[i]);
        }
    } else {
        await agendamentosModel.deleteAgendamentoID(data.selectedAgendamentos); 
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