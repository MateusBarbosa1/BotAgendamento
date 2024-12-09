module.exports = function(app) {
    const gerenciamentoControllers = require('../controllers/gerenciamentoControllers');
    app.get('/gerenciar', (req,res) => {
        gerenciamentoControllers.renderGerenciamento(app,req,res);
    });
    app.get("/gerenciar/wallyson", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoWallyson(app,req,res);
    });
    app.get("/gerenciar/bruno", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoBruno(app,req,res);
    });
    app.get("/gerenciar/bruno/agendamentos", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoAgendamentosBruno(app,req,res);
    });
    app.get("/gerenciar/bruno/data_hora", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoDataHoraBruno(app,req,res);
    });
    app.get("/gerenciar/bruno/horarios", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoHorariosBruno(app,req,res);
    });
    app.get("/gerenciar/wallyson/agendamentos", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoAgendamentosWallyson(app,req,res);
    });
    app.get("/gerenciar/wallyson/data_hora", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoDataHoraWallyson(app,req,res);
    });
    app.get("/gerenciar/wallyson/horarios", (req,res) => {
        gerenciamentoControllers.renderGerenciamentoHorariosWallyson(app,req,res);
    });

    app.post('/gerenciar/bruno/agendamentos', (req,res) => {
        gerenciamentoControllers.searchDateBruno(app,req,res);
    });
    app.post('/gerenciar/wallyson/agendamentos', (req,res) => {
        gerenciamentoControllers.searchDateWallyson(app,req,res);
    });
    app.post('/gerenciar/bruno/data_hora', (req,res) => {
        gerenciamentoControllers.gerenciarDataHoraBruno(app,req,res);
    });
    app.post('/gerenciar/wallyson/data_hora', (req,res) => {
        gerenciamentoControllers.gerenciarDataHoraWallyson(app,req,res);
    });
    app.post('/gerenciar/bruno/data_hora/delete', (req,res) => {
        gerenciamentoControllers.deletarDataHoraBruno(app,req,res);
    });
    app.post('/gerenciar/wallyson/data_hora/delete', (req,res) => {
        gerenciamentoControllers.deletarDataHoraWallyson(app,req,res);
    });
    app.post('/gerenciar/bruno/agendamento/delete', (req,res) => {
        gerenciamentoControllers.deleteAgendamento(app,req,res, "b");
    });
    app.post('/gerenciar/wallyson/agendamento/delete', (req,res) => {
        gerenciamentoControllers.deleteAgendamento(app,req,res,"w");
    });
    app.post('/gerenciar/bruno/horarios', (req,res) => {
        gerenciamentoControllers.getHorariosBruno(app,req,res);
    })
    app.post('/gerenciar/wallyson/horarios', (req,res) => {
        gerenciamentoControllers.getHorariosWallyson(app,req,res);
    })
    app.post('/horarios/bruno/update', (req,res) => {
        gerenciamentoControllers.updateHorariosBruno(app,req,res);
    });
    app.post('/horarios/bruno/add', (req,res) => {
        gerenciamentoControllers.addHorarioBruno(app,req,res);
    });
    app.post('/horarios/bruno/delete', (req,res) => {
        gerenciamentoControllers.deleteHorarioBruno(app,req,res);
    });
    app.post('/horarios/wallyson/update', (req,res) => {
        gerenciamentoControllers.updateHorariosWallyson(app,req,res);
    });
    app.post('/horarios/wallyson/add', (req,res) => {
        gerenciamentoControllers.addHorarioWallyson(app,req,res);
    });
    app.post('/horarios/wallyson/delete', (req,res) => {
        gerenciamentoControllers.deleteHorarioWallyson(app,req,res);
    });
    
}