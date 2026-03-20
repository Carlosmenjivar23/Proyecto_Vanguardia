const { Factura, DetalleFactura, Estudiante, Consumo, Padre, Producto } = require('../mysql');
const { sequelize } = require('../../config/database');
const { enviarFacturaGenerada, enviarConfirmacionPago } = require('../../services/mail.service');


async function cargarFacturaCompleta(factura_id) {
    return Factura.findByPk(factura_id, {
        include: [
            {
                model: Estudiante,
                as: 'estudiante',
                include: [{
                    model: Padre,
                    as: 'padre',
                    attributes: ['id', 'nombre_completo', 'email', 'telefono']
                }]
            },
            {
                model: DetalleFactura,
                as: 'detalles',
                include: [{
                    model: Consumo,
                    as: 'consumo',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        attributes: ['id', 'nombre']
                    }]
                }]
            }
        ]
    });
}

async function buscarPadreDeEstudiante(estudiante_id) {
    const estudiante = await Estudiante.findByPk(estudiante_id, {
        include: [{
            model: Padre,
            as: 'padre',
            attributes: ['id', 'nombre_completo', 'email', 'telefono']
        }]
    });
    return estudiante?.padre ?? null;
}

exports.getAllFacturas = async (req, res, next) => {
    try {
        const facturas = await Factura.findAll({
            include: [{
                model: Estudiante,
                as: 'estudiante',
                attributes: ['id', 'nombre_completo', 'grado', 'seccion']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: facturas });
    } catch (error) {
        next(error);
    }
};

exports.getFacturaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByPk(id, {
            include: [
                {
                    model: Estudiante,
                    as: 'estudiante',
                    include: [{ model: Padre, as: 'padre' }]
                },
                {
                    model: DetalleFactura,
                    as: 'detalles',
                    include: [{
                        model: Consumo,
                        as: 'consumo',
                        include: [{
                            model: Producto,
                            as: 'producto',
                            attributes: ['id', 'nombre']
                        }]
                    }]
                }
            ]
        });

        if (!factura) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }
        res.json({ success: true, data: factura });
    } catch (error) {
        next(error);
    }
};

exports.generarFacturaSemanal = async (req, res, next) => {
    try {
        const { estudiante_id, fecha_inicio, fecha_fin } = req.body;

    
        await sequelize.query(
            'CALL generar_factura_semanal(:estudiante_id, :fecha_inicio, :fecha_fin, @factura_id)',
            { replacements: { estudiante_id, fecha_inicio, fecha_fin } }
        );

        const [[{ '@factura_id': factura_id }]] = await sequelize.query('SELECT @factura_id as factura_id');

        const padre = await buscarPadreDeEstudiante(estudiante_id);
        console.log('Padre encontrado:', padre?.nombre_completo, '| Email:', padre?.email ?? 'sin email');

        
        let factura = await cargarFacturaCompleta(factura_id);
        if (!factura) {
            
            factura = await Factura.findOne({
                where: { estudiante_id },
                order: [['created_at', 'DESC']],
                include: [
                    { model: Estudiante, as: 'estudiante' },
                    {
                        model: DetalleFactura,
                        as: 'detalles',
                        include: [{ model: Consumo, as: 'consumo',
                            include: [{ model: Producto, as: 'producto', attributes: ['id','nombre'] }]
                        }]
                    }
                ]
            });
        }

        if (padre?.email && factura) {
            try {
                await enviarFacturaGenerada(factura, factura.detalles ?? [], padre);
                console.log(`✉️  Factura enviada a ${padre.email}`);
            } catch (mailErr) {
                console.warn('⚠️  Correo de factura no enviado:', mailErr.message);
            }
        } else if (!padre?.email) {
            console.log('ℹ️  Sin correo — padre sin email registrado');
        }

        res.status(201).json({
            success: true,
            message: padre?.email
                ? `Factura generada y enviada a ${padre.email}`
                : 'Factura generada correctamente (padre sin email)',
            data: factura
        });
    } catch (error) {
        next(error);
    }
};

exports.registrarPago = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { metodo_pago } = req.body;

        const factura = await Factura.findByPk(id);
        if (!factura) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }

        await factura.update({
            estado:     'pagada',
            fecha_pago: new Date(),
            metodo_pago
        });

       
        const facturaCompleta = await cargarFacturaCompleta(id);
        const padre = await buscarPadreDeEstudiante(factura.estudiante_id);

        if (padre?.email) {
            try {
                await enviarConfirmacionPago(facturaCompleta, padre);
                console.log(`✉️  Confirmación de pago enviada a ${padre.email}`);
            } catch (mailErr) {
                console.warn('⚠️  Correo de pago no enviado:', mailErr.message);
            }
        }

        res.json({
            success: true,
            message: padre?.email
                ? `Pago registrado y confirmación enviada a ${padre.email}`
                : 'Pago registrado correctamente (padre sin email)',
            data: facturaCompleta
        });
    } catch (error) {
        next(error);
    }
};

exports.anularFactura = async (req, res, next) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByPk(id);

        if (!factura) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }

        await factura.update({ estado: 'anulada' });

        res.json({
            success: true,
            message: 'Factura anulada exitosamente',
            data: factura
        });
    } catch (error) {
        next(error);
    }
};

exports.getFacturasByEstudiante = async (req, res, next) => {
    try {
        const { estudiante_id } = req.params;
        const facturas = await Factura.findAll({
            where: { estudiante_id },
            include: [{ model: DetalleFactura, as: 'detalles' }],
            order: [['fecha_emision', 'DESC']]
        });
        res.json({ success: true, data: facturas });
    } catch (error) {
        next(error);
    }
};