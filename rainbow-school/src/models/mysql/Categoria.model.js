const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Categoria = sequelize.define('categorias_productos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'El nombre de la categoría es requerido' }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Categoria;