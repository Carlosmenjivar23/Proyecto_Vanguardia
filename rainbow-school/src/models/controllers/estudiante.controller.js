const { Estudiante, Padre } = require('../mysql');
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');

exports.getAllEstudiantes = async (req, res, next) => {
    try {
        const estudiantes = await Estudiante.findAll({
            include: [{
                model: Padre,
                as: 'padre',
                attributes: ['id', 'nombre_completo', 'identificacion', 'telefono']
            }],
            order: [['nombre_completo', 'ASC']]
        });
        
        res.json({ success: true, data: estudiantes });
    } catch (error) {
        next(error);
    }
};

exports.getEstudianteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiante.findByPk(id, {
            include: [{ model: Padre, as: 'padre' }]
        });
        
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }
        
        res.json({ success: true, data: estudiante });
    } catch (error) {
        next(error);
    }
};

exports.buscarEstudiantes = async (req, res, next) => {
    try {
        const { termino } = req.query;
        
        const estudiantes = await Estudiante.findAll({
            where: {
                [Op.or]: [
                    { nombre_completo: { [Op.like]: `%${termino}%` } },
                    { identificacion: { [Op.like]: `%${termino}%` } }
                ]
            },
            include: [{
                model: Padre,
                as: 'padre',
                attributes: ['nombre_completo', 'telefono']
            }],
            limit: 10
        });
        
        res.json({ success: true, data: estudiantes });
    } catch (error) {
        next(error);
    }
};

exports.createEstudiante = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { estudiante, padre } = req.body;

        let padre_id = null;

        
        if (padre && padre.identificacion) {
            let padreRecord = await Padre.findOne({
                where: { identificacion: padre.identificacion }
            });
            if (!padreRecord) {
                padreRecord = await Padre.create(padre, { transaction });
            }
            padre_id = padreRecord.id;
        }

        const nuevoEstudiante = await Estudiante.create({
            ...estudiante,
            padre_id,
            credito_disponible: estudiante.credito_aprobado
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: nuevoEstudiante
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

exports.updateEstudiante = async (req, res, next) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiante.findByPk(id);
        
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }
        
        await estudiante.update(req.body);
        
        res.json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            data: estudiante
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteEstudiante = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Consumo, Factura } = require('../mysql');

        const estudiante = await Estudiante.findByPk(id);
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        const totalConsumos = await Consumo.count({ where: { estudiante_id: id } });
        const totalFacturas = await Factura.count({ where: { estudiante_id: id } });

        if (totalConsumos > 0 || totalFacturas > 0) {
          
            await estudiante.update({ estado: 'egresado' });
            return res.json({
                success: true,
                desactivado: true,
                message: `El estudiante tiene ${totalConsumos} consumo(s) y ${totalFacturas} factura(s) registradas. Fue desactivado para preservar el historial.`,
                data: estudiante
            });
        }

      
        await estudiante.destroy();
        res.json({ success: true, desactivado: false, message: 'Estudiante eliminado exitosamente' });

    } catch (error) {
        next(error);
    }
};