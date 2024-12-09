module.exports = function(app) {
    const homeController = require('../controllers/homeControllers.js');
    
    app.get('/home', (req,res) => {
        homeController.renderHome(app,req,res);
    });
    app.get('/home/wallyson', (req,res) => {
        homeController.renderHome2(app,req,res);
    });
    app.post('/delete/id', (req,res) => {
        homeController.deleteAgendamentoID(app,req,res);
    });
}