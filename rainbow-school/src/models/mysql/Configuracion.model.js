const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Configuracion = sequelize.define('configuracion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clave: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    valor: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Configuracion;