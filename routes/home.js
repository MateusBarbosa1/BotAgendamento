module.exports = function(app) {
    const homeController = require('../controllers/homeControllers.js');
    
    app.get('/home', (req,res) => {
        homeController.renderHome(app,req,res);
    });
    app.get('/home/wallyson', (req,res) => {
        homeController.renderHome2(app,req,res);
    });
    app.post('/home', (req,res) => {
        homeController.searchDate(app,req,res);
    });
    app.post('/home/wallyson', (req,res) => {
        homeController.searchDate2(app,req,res);
    });
}