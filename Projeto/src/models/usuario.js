const Sequelize = require('sequelize');
const database = require('../db');
const ContaCorrente = require('./contaCorrente');
 
const Usuario = database.define('usuario', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false,
    },
})

 Usuario.hasMany(ContaCorrente);
 ContaCorrente.belongsTo(Usuario);

module.exports = Usuario;