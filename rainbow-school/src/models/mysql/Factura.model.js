const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Factura = sequelize.define('facturas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero_factura: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    estudiante_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_emision: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
        defaultValue: 'pendiente'
    },
    fecha_pago: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Factura;