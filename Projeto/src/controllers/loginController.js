const Usuario = require("../models/usuario");
const database = require("../db");

function loginView(req, res) {
  res.render("login/login.html", {});
}

async function realizarLogin(req, res) {
  const usuario = await Usuario.findOne({
    where: { email: req.body.email, senha: req.body.senha },
  });

  if (!usuario) {
    return res.render("login/login.html", {
      erro: "Usuário ou senha inválidos",
    });
  }
  req.session.autorizado = true;
  req.session.usuario = usuario;
  res.redirect("/conta/listar");
}

function sair(req, res) {
  req.session.destroy(function (err) {
    console.log("Usuário desautorizado");
  });
  let sucesso_saida = true;
  res.render("login/login.html", { sucesso_saida });
}

function verificarAutenticacao(req, res, next) {
  if (req.session.autorizado) {
    console.log("Usuário autorizado");
    next();
  } else {
    console.log("Usuário NÃO autorizado");
    res.redirect("/");
  }
}

module.exports = {
  loginView,
  realizarLogin,
  verificarAutenticacao,
  sair,
};
