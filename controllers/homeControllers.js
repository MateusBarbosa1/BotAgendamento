module.exports.renderHome = async function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.redirect('/');
    } else {
        console.log(jwtDecode(token));
        if(jwtDecode(token).user == "BrunoAdmin") {
            const agendamentosModel = require('../models/agendamentosModel');
            const agendamentos = await agendamentosModel.getAgendamentos(new Date(), "Bruno");
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
        console.log(jwtDecode(token));
        if(jwtDecode(token).user == "BrunoAdmin") {
            const agendamentosModel = require('../models/agendamentosModel');
            const agendamentos = await agendamentosModel.getAgendamentos(new Date(), "Wallyson");
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