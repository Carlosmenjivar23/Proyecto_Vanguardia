const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Estudiante = sequelize.define('estudiantes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_completo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del estudiante es requerido' }
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
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    grado: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    seccion: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    telefono_contacto: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true
},
    credito_aprobado: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    credito_disponible: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    estado: {
        type: DataTypes.ENUM('activo', 'suspendido', 'egresado'),
        defaultValue: 'activo'
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Estudiante;