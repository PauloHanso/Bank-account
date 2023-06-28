const Sequelize = require("sequelize");
const database = require("../db");

const Movimento = database.define("movimento", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  tipo: {
    type: Sequelize.STRING(1),
    allowNull: false,
  },
  data_movimento: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  valor: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  conta_corrente_origem: {
    type: Sequelize.BIGINT,
  },
  conta_corrente_destino: {
    type: Sequelize.BIGINT,
  },
  observacao: {
    type: Sequelize.STRING,
  },
});

module.exports = Movimento;
