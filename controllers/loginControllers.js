module.exports.renderLogin = function(app,req,res) {
    const { jwtDecode } = require("jwt-decode");

    const token = req.cookies["token"];
    if(token === undefined) {
        res.render('login/index');
    } else {
        console.log(jwtDecode(token));
        if(jwtDecode(token).user == "BrunoAdmin") {
            res.redirect('/home');
        } else {
            res.render('login/index');
        }
    }
}
module.exports.authAdmin = function(app,req,res) {
    const jwt = require("jsonwebtoken");

    const dotenv = require("dotenv");
    dotenv.config();

    const data = req.body;
    console.log(process.env.USERNAME);
    console.log(process.env.PASSWORD);
    if(data.user == process.env.USERNAME && data.password == process.env.PASSWORD) {
        const token = jwt.sign({ user: "BrunoAdmin" }, process.env.SECRET);
        res.cookie("token", token);
        res.redirect("/home");
    }
}
module.exports.validationToken = (req, res, next) => {
    const tokenCookie = req.cookies["token"];
  
    if (tokenCookie === undefined) {
      res.redirect("/");
    }
  
    try {
      jwt.verify(tokenCookie, process.env.SECRET);
      next();
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
}