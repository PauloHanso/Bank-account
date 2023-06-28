const express = require("express");
const router = express.Router();

const contaCorrenteController = require("../controllers/contaCorrenteController");
const loginController = require("../controllers/loginController");

router.get(
  "/conta/cadastrar",
  loginController.verificarAutenticacao,
  contaCorrenteController.cadastrarcontaView
);
router.post(
  "/conta/cadastrar",
  loginController.verificarAutenticacao,
  contaCorrenteController.cadastrarConta
);

router.get(
  "/conta/listar",
  loginController.verificarAutenticacao,
  contaCorrenteController.listarViewContas
);

router.get(
  "/conta/editar/:id",
  loginController.verificarAutenticacao,
  contaCorrenteController.editarContaView
);
router.post(
  "/conta/editar",
  loginController.verificarAutenticacao,
  contaCorrenteController.editarConta
);

router.get(
  "/conta/excluir/:id",
  loginController.verificarAutenticacao,
  contaCorrenteController.excluirContaView
);
router.post(
  "/conta/excluir",
  loginController.verificarAutenticacao,
  contaCorrenteController.excluirConta
);

router.get(
  "/conta/transferencia",
  loginController.verificarAutenticacao,
  contaCorrenteController.transferenciaView
);
router.post(
  "/conta/transferencia",
  loginController.verificarAutenticacao,
  contaCorrenteController.realizarTransferencia
);

router.get(
  "/conta/deposito",
  loginController.verificarAutenticacao,
  contaCorrenteController.depositoView
);
router.post(
  "/conta/deposito",
  loginController.verificarAutenticacao,
  contaCorrenteController.realizarDeposito
);

router.get(
  "/conta/extrato/:id",
  loginController.verificarAutenticacao,
  contaCorrenteController.extratoView
);
router.post(
  "/conta/filtrar/extrato",
  loginController.verificarAutenticacao,
  contaCorrenteController.filtrarExtrato
);

module.exports = router;
