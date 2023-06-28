const express = require('express');
const router = express.Router();

const pessoaController = require('../controllers/pessoaController');
const loginController = require("../controllers/loginController");

router.get('/pessoa/cadastrar/:esconder?', pessoaController.cadastrarView);
router.post('/pessoa/cadastrar', pessoaController.cadastrarPessoa);

router.get('/pessoa/listar', loginController.verificarAutenticacao, pessoaController.listarView);

router.get('/pessoa/editar/:id', loginController.verificarAutenticacao, pessoaController.editarView);
router.post('/pessoa/editar', loginController.verificarAutenticacao,pessoaController.editarPessoa);

router.get('/pessoa/excluir/:id',loginController.verificarAutenticacao, pessoaController.excluirView);
router.post('/pessoa/excluir', loginController.verificarAutenticacao, pessoaController.excluirPessoa);

module.exports = router;