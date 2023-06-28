const { Op } = require("sequelize");
const ContaCorrente = require("../models/contaCorrente");
const Movimento = require("../models/movimento");
const Pessoa = require("../models/pessoa");
const Usuario = require("../models/usuario");

function cadastrarcontaView(req, res) {
  res.render("contaCorrente/cadastrar.html", {});
}

async function cadastrarConta(req, res) {
  let conta = {
    nome: req.body.nome,
    numero: req.body.numero,
    data_abertura: new Date(req.body.data_abertura.split("-")),
    saldo: 0,
    usuarioId: req.session.usuario.id,
  };
  ContaCorrente.create(conta)
    .then((result) => {
      res.render("contaCorrente/cadastrar.html", { conta });
    })
    .catch((err) => {
      let erro = err;
      res.render("contaCorrente/cadastrar.html", { erro });
    });
}

function listarViewContas(req, res) {
  return realizarBusca(req, res);
}

function realizarBusca(req, res) {
  ContaCorrente.findAll({
    include: [
      {
        model: Usuario,
        include: [Pessoa],
      },
    ],
    where: {
      usuarioId: req.session.usuario.id,
    },
  })
    .then((contas) => {
      const contasFormatadas = contas.map((conta) => {
        const dataFormatada = new Date(conta.data_abertura).toLocaleDateString(
          "pt-BR"
        );

        return {
          id: conta.id,
          numero: conta.numero,
          saldo: conta.saldo,
          data_abertura: dataFormatada,
          responsavel: conta.usuario.pessoa.nome,
          nome: conta.nome,
        };
      });

      res.render("contaCorrente/listar.html", { contas: contasFormatadas });
    })
    .catch((err) => {
      let erro = err;
      res.render("contaCorrente/listar.html", { erro });
    });
}
async function editarContaView(req, res) {
  req.session.conta_id = req.params.id;

  ContaCorrente.findByPk(req.session.conta_id, {
    include: [
      {
        model: Usuario,
        include: [Pessoa],
      },
    ],
  }).then(function (conta) {
    const dataFormatada = new Date(conta.data_abertura).toLocaleDateString(
      "pt-BR"
    );
    const partesData = dataFormatada.split("/");

    res.render("contaCorrente/editar.html", {
      conta: {
        nome: conta.nome,
        numero: conta.numero,
        data_abertura: `${partesData[2]}-${partesData[1]}-${partesData[0]}`,
        cpf: conta.usuario.pessoa.cpf,
      },
    });
  });
}

async function editarConta(req, res) {
  let contaCorrente = {
    nome: req.body.nome,
    numero: req.body.numero,
    data_abertura: new Date(req.body.data_abertura.split("-")),
    usuarioId: req.session.usuario.id,
  };

  ContaCorrente.update(contaCorrente, { where: { id: req.session.conta_id } })
    .then(function (sucesso) {
      let conta = {
        nome: req.body.nome,
        numero: req.body.numero,
        data_abertura: req.body.data_abertura,
        cpf: req.body.cpf,
      };
      res.render("contaCorrente/editar.html", { conta, sucesso });
    })
    .catch(function (conta, erro) {
      res.render("contaCorrente/editar.html", { conta, erro });
    });
}

function excluirContaView(req, res) {
  req.session.conta_id = req.params.id;
  ContaCorrente.findByPk(req.session.conta_id).then(function (conta) {
    res.render("contaCorrente/excluir.html", { conta });
  });
}

function excluirConta(req, res) {
  ContaCorrente.destroy({
    where: {
      id: req.session.conta_id,
    },
  }).then(function () {
    return realizarBusca(res);
  });
}
function transferenciaView(req, res) {
  res.render("contaCorrente/transferencia.html");
}

async function realizarTransferencia(req, res) {
  if (
    req.body.destino == null ||
    req.body.origem == null ||
    req.body.valor == null
  ) {
    return res.render("contaCorrente/transferencia.html", {
      erro: "Preencha todos os campos para realizar a transferência",
    });
  }

  const destino = await ContaCorrente.findOne({
    where: { numero: req.body.destino },
  });

  if (!destino) {
    return res.render("contaCorrente/transferencia.html", {
      erro: "Nao foi possivel encontrar a conta destino",
    });
  }

  const origem = await ContaCorrente.findOne({
    where: { numero: req.body.origem },
  });

  if (!origem) {
    return res.render("contaCorrente/transferencia.html", {
      erro: "Nao foi possivel encontrar a conta origem",
    });
  }

  if (origem.saldo < req.body.valor) {
    return res.render("contaCorrente/transferencia.html", {
      erro: "Saldo insuficiente",
    });
  }

  if (req.body.valor < 0) {
    return res.render("contaCorrente/transferencia.html", {
      erro: "O valor não pode ser negativo!",
    });
  }
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let informacoesSaldoOrigem = {
    saldo: origem.saldo - req.body.valor,
  };
  ContaCorrente.update(informacoesSaldoOrigem, {
    where: { id: origem.id },
  })
    .then(function () {
      let movimentoDebito = {
        tipo: "D",
        data_movimento: `${year}-${month}-${day}`,
        valor: req.body.valor,
        conta_corrente_origem: origem.numero,
        conta_corrente_destino: destino.numero,
        contaCorrenteId: origem.id,
      };

      Movimento.create(movimentoDebito).then(function () {
        let informacoesSaldoDestino = {
          saldo: Number(destino.saldo) + Number(req.body.valor),
        };
        ContaCorrente.update(informacoesSaldoDestino, {
          where: { id: destino.id },
        }).then(function () {
          let movimentoCredito = {
            tipo: "C",
            data_movimento: `${year}-${month}-${day}`,
            valor: req.body.valor,
            conta_corrente_origem: origem.numero,
            conta_corrente_destino: destino.numero,
            contaCorrenteId: destino.id,
          };
          Movimento.create(movimentoCredito).then(function () {
            return res.render("contaCorrente/transferencia.html", {
              sucesso: "Transferencia realizada com sucesso",
            });
          });
        });
      });
    })
    .catch(function (erro) {
      return res.render("contaCorrente/transferencia.html", {
        erro,
      });
    });
}

function depositoView(req, res) {
  res.render("contaCorrente/deposito.html");
}

async function realizarDeposito(req, res) {
  if (req.body.valor <= 0) {
    return res.render("contaCorrente/deposito.html", {
      erro: "O valor deve ser maior que zero",
    });
  }

  const conta = await ContaCorrente.findOne({
    where: { numero: req.body.destino },
  });

  if (!conta) {
    return res.render("contaCorrente/deposito.html", {
      erro: "Não foi possivel encontrar a conta com esse número",
    });
  }

  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  conta
    .update({ saldo: Number(conta.saldo) + Number(req.body.valor) })
    .then(function (sucesso) {
      let movimento = {
        tipo: "C",
        data_movimento: `${year}-${month}-${day}`,
        valor: req.body.valor,
        conta_corrente_destino: conta.numero,
        observacao: "DEPOSITO",
        contaCorrenteId: conta.id,
      };
      Movimento.create(movimento).then(function () {
        return res.render("contaCorrente/deposito.html", { sucesso });
      });
    })
    .catch(function (erro) {
      return res.render("contaCorrente/deposito.html", { erro });
    });
}

function extratoView(req, res) {
  req.session.conta_id = req.params.id;
  Movimento.findAll({ where: { contaCorrenteId: req.session.conta_id } }).then(
    function (movimentos) {
      const movimentacoesFormatadas = movimentos.map((movimento) => {
        const dataFormatada = new Date(
          movimento.data_movimento
        ).toLocaleDateString("pt-BR");

        return {
          id: movimento.id,
          tipo: movimento.tipo == "D" ? "DÉBITO" : "CRÉDITO",
          data_movimento: dataFormatada,
          valor: movimento.valor,
          conta_corrente_origem: movimento.conta_corrente_origem,
          conta_corrente_destino: movimento.conta_corrente_destino,
          observacao: movimento.observacao,
        };
      });
      res.render("contaCorrente/extrato.html", {
        movimentacoes: movimentacoesFormatadas,
      });
    }
  );
}
function filtrarExtrato(req, res) {
  Movimento.findAll({
    where: {
      data_movimento: {
        [Op.between]: [
          new Date(req.body.periodo_inicial),
          new Date(req.body.periodo_final),
        ],
      },
      contaCorrenteId: req.session.conta_id,
    },
  }).then(function (movimentos) {
    const movimentacoesFormatadas = movimentos.map((movimento) => {
      const dataFormatada = new Date(
        movimento.data_movimento
      ).toLocaleDateString("pt-BR");

      return {
        id: movimento.id,
        tipo: movimento.tipo == "D" ? "DÉBITO" : "CRÉDITO",
        data_movimento: dataFormatada,
        valor: movimento.valor,
        conta_corrente_origem: movimento.conta_corrente_origem,
        conta_corrente_destino: movimento.conta_corrente_destino,
        observacao: movimento.observacao,
      };
    });
    res.render("contaCorrente/extrato.html", {
      movimentacoes: movimentacoesFormatadas,
    });
  });
}

module.exports = {
  cadastrarcontaView,
  cadastrarConta,
  listarViewContas,
  editarContaView,
  editarConta,
  excluirContaView,
  excluirConta,
  transferenciaView,
  realizarTransferencia,
  depositoView,
  realizarDeposito,
  extratoView,
  filtrarExtrato,
};
