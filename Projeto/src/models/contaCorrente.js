const Sequelize = require("sequelize");
const database = require("../db");
const Movimento = require("./movimento");

const ContaCorrente = database.define("conta_corrente", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  numero: {
    type: Sequelize.BIGINT,
    allowNull: false,
    unique: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  data_abertura: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  saldo: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
});

ContaCorrente.hasMany(Movimento);
Movimento.belongsTo(ContaCorrente);

module.exports = ContaCorrente;
