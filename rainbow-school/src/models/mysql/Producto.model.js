const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Producto = sequelize.define('productos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'El código del producto es requerido' }
        }
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del producto es requerido' }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'El precio no puede ser negativo' }
        }
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unidad_medida: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'agotado', 'descontinuado'),
        defaultValue: 'disponible'
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Producto;