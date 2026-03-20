const { Consumo, Estudiante, Producto } = require('../mysql');
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');

exports.getConsumos = async (req, res, next) => {
    try {
        const { fecha, estudiante_id, facturado } = req.query;
        let where = {};
        
        if (fecha) where.fecha_consumo = fecha;
        if (estudiante_id) where.estudiante_id = estudiante_id;
        if (facturado !== undefined) where.facturado = facturado === 'true';
        
        const consumos = await Consumo.findAll({
            where,
            include: [
                {
                    model: Estudiante,
                    as: 'estudiante',
                    attributes: ['id', 'nombre_completo', 'grado', 'seccion']
                },
                {
                    model: Producto,
                    as: 'producto',
                    attributes: ['id', 'nombre', 'codigo']
                }
            ],
            order: [['fecha_consumo', 'DESC'], ['hora_consumo', 'DESC']]
        });
        
        res.json({ success: true, data: consumos });
    } catch (error) {
        next(error);
    }
};

exports.registrarConsumo = async (req, res, next) => {
    try {
        const { estudiante_id, producto_id, cantidad, observaciones } = req.body;
        
        await sequelize.query(
            'CALL registrar_consumo(:estudiante_id, :producto_id, :cantidad, :observaciones, @consumo_id)',
            {
                replacements: {
                    estudiante_id,
                    producto_id,
                    cantidad,
                    observaciones: observaciones || null
                }
            }
        );
        
        const [[{ '@consumo_id': consumo_id }]] = await sequelize.query('SELECT @consumo_id as consumo_id');
        
        const consumo = await Consumo.findByPk(consumo_id, {
            include: [
                { model: Estudiante, as: 'estudiante' },
                { model: Producto, as: 'producto' }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Consumo registrado exitosamente',
            data: consumo
        });
    } catch (error) {
        next(error);
    }
};

exports.getConsumoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const consumo = await Consumo.findByPk(id, {
            include: [
                { model: Estudiante, as: 'estudiante' },
                { model: Producto, as: 'producto' }
            ]
        });
        
        if (!consumo) {
            return res.status(404).json({ success: false, message: 'Consumo no encontrado' });
        }
        
        res.json({ success: true, data: consumo });
    } catch (error) {
        next(error);
    }
};

exports.deleteConsumo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const consumo = await Consumo.findByPk(id);
        
        if (!consumo) {
            return res.status(404).json({ success: false, message: 'Consumo no encontrado' });
        }
        
        await consumo.destroy();
        
        res.json({ success: true, message: 'Consumo eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

exports.getConsumosSemanales = async (req, res, next) => {
    try {
        const { estudiante_id } = req.params;
        
        const consumos = await Consumo.findAll({
            where: {
                estudiante_id,
                facturado: false,
                fecha_consumo: { [Op.gte]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 7 DAY)') }
            },
            include: [{ model: Producto, as: 'producto' }],
            order: [['fecha_consumo', 'DESC'], ['hora_consumo', 'DESC']]
        });
        
        const total = consumos.reduce((sum, c) => sum + parseFloat(c.subtotal), 0);
        
        res.json({
            success: true,
            data: { consumos, total }
        });
    } catch (error) {
        next(error);
    }
};