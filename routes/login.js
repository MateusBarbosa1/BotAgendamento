module.exports = function(app) {
    const loginController = require('../controllers/loginControllers');
    app.get('/', (req,res) => {
        loginController.renderLogin(app,req,res);
    });
    app.post('/', (req,res) => {
        loginController.authAdmin(app,req,res);
    });
}