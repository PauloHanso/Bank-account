const express = require("express");
const mustacheExpress = require("mustache-express");
const db = require("./src/db");
const session = require('express-session')

const app = express();

app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set("views", __dirname + "/src/views");

app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'secret-token',
  name: 'sessionId',  
  resave: false,
  saveUninitialized: false
}))

// Define as rotas da aplicação (declaradas na pasta /src/routes/)
app.use("/", require("./src/routes/loginRoutes"));
app.use("/", require("./src/routes/pessoaRoutes"));
app.use("/", require("./src/routes/contaRoutes"));

db.sync(() => console.log(`Banco de dados conectado`));

const app_port = 8000;
app.listen(app_port, function () {
  console.log("app rodando na porta " + app_port);
});
