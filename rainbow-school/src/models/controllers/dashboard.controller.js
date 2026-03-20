const { sequelize } = require('../../config/database');
const { Estudiante, Consumo, Factura } = require('../mysql');
const { Op } = require('sequelize');

exports.getResumen = async (req, res, next) => {
    try {
       
        const [totalEstudiantes, consumosHoy, facturasPendientes, creditoDisponible] = await Promise.all([
            Estudiante.count({ where: { estado: 'activo' } }),
            
            Consumo.sum('subtotal', {
                where: {
                    fecha_consumo: sequelize.fn('CURDATE'),
                    facturado: false
                }
            }),
            Factura.count({ where: { estado: 'pendiente' } }),
            Estudiante.sum('credito_disponible', { where: { estado: 'activo' } })
        ]);

        res.json({
            success: true,
            data: {
                total_estudiantes:       totalEstudiantes    || 0,
                consumos_hoy:            consumosHoy         || 0,
                facturas_pendientes:     facturasPendientes  || 0,
                credito_disponible_total: creditoDisponible  || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getConsumosDiarios = async (req, res, next) => {
    try {
        const [result] = await sequelize.query(`
            SELECT
                fecha_consumo,
                COUNT(*) AS total_consumos,
                SUM(subtotal) AS total_gastado
            FROM consumos
            WHERE fecha_consumo >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY fecha_consumo
            ORDER BY fecha_consumo ASC
        `);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getTopProductos = async (req, res, next) => {
    try {
        const [result] = await sequelize.query(`
            SELECT
                p.id, p.nombre,
                COUNT(c.id)    AS total_ventas,
                SUM(c.cantidad) AS cantidad_total,
                SUM(c.subtotal) AS total_gastado
            FROM consumos c
            INNER JOIN productos p ON c.producto_id = p.id
            WHERE c.fecha_consumo >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.id, p.nombre
            ORDER BY total_ventas DESC
            LIMIT 5
        `);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getTopEstudiantes = async (req, res, next) => {
    try {
        const [result] = await sequelize.query(`
            SELECT
                e.id, e.nombre_completo, e.grado, e.seccion,
                COUNT(c.id)    AS total_consumos,
                SUM(c.subtotal) AS total_gastado
            FROM consumos c
            INNER JOIN estudiantes e ON c.estudiante_id = e.id
            WHERE c.fecha_consumo >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY e.id, e.nombre_completo, e.grado, e.seccion
            ORDER BY total_gastado DESC
            LIMIT 5
        `);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
