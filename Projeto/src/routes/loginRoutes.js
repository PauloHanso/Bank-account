const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");

router.get("/", loginController.loginView);
router.post("/login", loginController.realizarLogin);
router.post("/sair", loginController.sair);

module.exports = router;
