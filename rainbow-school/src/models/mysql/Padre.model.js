const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Padre = sequelize.define('padres', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_completo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del padre es requerido' }
        }
    },
    identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'La identificación es requerida' }
        }
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: { msg: 'Debe ser un email válido' }
        }
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ocupacion: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Padre;