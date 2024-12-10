module.exports.renderHome = async function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        if(jwtDecode(token).user == "BrunoAdmin") {
            const dataBrasileira = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
            dataBrasileira.setHours(0, 0, 0, 0);
            const agendamentosModel = require('../models/agendamentosModel');
            const agendamentos = await agendamentosModel.getAgendamentos(dataBrasileira, "Bruno");
            res.render('home/index', {agendamentos: agendamentos});
        } else {
            res.redirect('/');
        }
    }
}
module.exports.renderHome2 = async function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        if(jwtDecode(token).user == "BrunoAdmin") {
            const dataBrasileira = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
            dataBrasileira.setHours(0, 0, 0, 0);
            const agendamentosModel = require('../models/agendamentosModel');
            const agendamentos = await agendamentosModel.getAgendamentos(dataBrasileira, "Wallyson");
            res.render('home/wallyson', {agendamentos: agendamentos});
        } else {
            res.redirect('/');
        }
    }
}
module.exports.searchDate = async function(app,req,res) {
    const agendamentosModel = require('../models/agendamentosModel');
    
    const agendamentos = await agendamentosModel.getAgendamentos(req.body.date, "Bruno");
    res.render("home/index", {agendamentos: agendamentos})
}
module.exports.searchDate2 = async function(app,req,res) {
    const agendamentosModel = require('../models/agendamentosModel');
    
    const agendamentos = await agendamentosModel.getAgendamentos(req.body.date, "Wallyson");
    res.render("home/wallyson", {agendamentos: agendamentos})
}
module.exports.deleteAgendamentoID = async function(app,req,res) {
    const data = req.body;
    
    const agendamentosModel = require('../models/agendamentosModel');
    await agendamentosModel.deleteAgendamentoID(data.id);
    res.redirect(data.link);
}