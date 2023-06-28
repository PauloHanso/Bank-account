const Pessoa = require("../models/pessoa");
const Usuario = require("../models/usuario");

function cadastrarView(req, res) {
  let esconder = req.params.esconder;
  
  if(esconder){
    res.render("pessoa/cadastrar.html", {esconder});
  }else{
    res.render("pessoa/cadastrar.html", {});
  }
 
}

function cadastrarPessoa(req, res) {
  
  let pessoa = {
    nome: req.body.nome,
    cpf: req.body.cpf,
    data_nascimento: new Date(req.body.data_nascimento.split("-")),
    telefone: req.body.telefone,
    endereco: req.body.endereco,
    cep: req.body.cep,
  };

  Pessoa.create(pessoa)
    .then((result) => {
      let usuario = {
        pessoaId: result.id,
        email: req.body.email,
        senha: req.body.senha,
      };

      Usuario.create(usuario);

      res.render("pessoa/cadastrar.html", { pessoa });
    })
    .catch((err) => {
      let erro = err;
      res.render("pessoa/cadastrar.html", { erro });
    });
}

function listarView(req, res) {
  realizarBusca(res);
}

async function editarView(req, res) {
  let id = req.params.id;

  const usuario = await Usuario.findOne({ where: { pessoaId: req.params.id } });

  Pessoa.findByPk(id).then(function (pessoa) {
    const dataFormatada = new Date(pessoa.data_nascimento).toLocaleDateString(
      "pt-BR"
    );
    const partesData = dataFormatada.split("/");

    const usuarioData = usuario
      ? { email: usuario.email, senha: usuario.senha }
      : null;

    res.render("pessoa/editar.html", {
      pessoa: {
        id: pessoa.id,
        nome: pessoa.nome,
        cpf: pessoa.cpf,
        data_nascimento: `${partesData[2]}-${partesData[1]}-${partesData[0]}`,
        telefone: pessoa.telefone,
        endereco: pessoa.endereco,
        cep: pessoa.cep,
      },
      usuario: usuarioData,
    });
  });
}

async function editarPessoa(req, res) {
  let informacoesPessoa = {
    nome: req.body.nome,
    cpf: req.body.cpf,
    data_nascimento: new Date(req.body.data_nascimento.split("-")),
    telefone: req.body.telefone,
    endereco: req.body.endereco,
    cep: req.body.cep,
  };

  Pessoa.update(informacoesPessoa, { where: { id: req.body.id } })
    .then(async function (sucesso) {
      let pessoa = {
        nome: req.body.nome,
        cpf: req.body.cpf,
        data_nascimento: req.body.data_nascimento,
        telefone: req.body.telefone,
        endereco: req.body.endereco,
        cep: req.body.cep,
      };

      await Usuario.update(
        { email: req.body.email, senha: req.body.senha },
        { where: { pessoaId: req.body.id } }
      );

      const usuarioData = await Usuario.findOne({
        where: { pessoaId: req.body.id },
      });

      res.render("pessoa/editar.html", {
        pessoa,
        usuario: { email: usuarioData.email, senha: usuarioData.senha },
        sucesso,
      });
    })
    .catch(function (pessoa, erro) {
      res.render("pessoa/editar.html", { pessoa, erro });
    });
}

function excluirView(req, res) {
  let id = req.params.id;
  Pessoa.findByPk(id).then(function (pessoa) {
    res.render("pessoa/excluir.html", { pessoa });
  });
}

function excluirPessoa(req, res) {
  Usuario.destroy({
    where: {
      pessoaId: req.body.id,
    },
  }).then(function () {
    Pessoa.destroy({
      where: {
        id: req.body.id,
      },
    }).then(function () {
      return realizarBusca(res);
    });
  });
}

function realizarBusca(res) {
  Pessoa.findAll()
    .then((pessoas) => {
      const pessoasFormatadas = pessoas.map((pessoa) => {
        const dataFormatada = new Date(
          pessoa.data_nascimento
        ).toLocaleDateString("pt-BR");
        return {
          id: pessoa.id,
          nome: pessoa.nome,
          cpf: pessoa.cpf,
          data_nascimento: dataFormatada,
          telefone: pessoa.telefone,
          endereco: pessoa.endereco,
          cep: pessoa.cep,
        };
      });
      res.render("pessoa/listar.html", { pessoas: pessoasFormatadas });
    })
    .catch((err) => {
      console.log(err);
      let erro = err;
      res.render("pessoa/listar.html", { erro });
    });
}

module.exports = {
  cadastrarView,
  cadastrarPessoa,
  listarView,
  editarView,
  editarPessoa,
  excluirPessoa,
  excluirView,
};
