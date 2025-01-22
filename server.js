const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require("ejs").renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views'));

require('./routes/home')(app);
require('./routes/login')(app);
require('./routes/gerenciamento')(app);

// Inicializa o servidor
app.listen(3000, () => {
    console.log('Server running on port 3000!');
});
