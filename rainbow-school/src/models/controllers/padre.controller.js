const { Padre, Estudiante } = require('../mysql');

exports.getAllPadres = async (req, res, next) => {
    try {
        const padres = await Padre.findAll({
            include: [{
                model: Estudiante,
                as: 'estudiantes',
                attributes: ['id', 'nombre_completo', 'grado', 'seccion', 'estado']
            }],
            order: [['nombre_completo', 'ASC']]
        });
        res.json({ success: true, data: padres });
    } catch (error) {
        next(error);
    }
};

exports.getPadreById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const padre = await Padre.findByPk(id, {
            include: [{
                model: Estudiante,
                as: 'estudiantes',
                attributes: ['id', 'nombre_completo', 'grado', 'seccion', 'estado']
            }]
        });
        if (!padre) {
            return res.status(404).json({ success: false, message: 'Padre no encontrado' });
        }
        res.json({ success: true, data: padre });
    } catch (error) {
        next(error);
    }
};

exports.createPadre = async (req, res, next) => {
    try {
        const padre = await Padre.create(req.body);
        res.status(201).json({ success: true, message: 'Padre creado exitosamente', data: padre });
    } catch (error) {
        next(error);
    }
};

exports.updatePadre = async (req, res, next) => {
    try {
        const { id } = req.params;
        const padre = await Padre.findByPk(id);
        if (!padre) {
            return res.status(404).json({ success: false, message: 'Padre no encontrado' });
        }
        await padre.update(req.body);
        res.json({ success: true, message: 'Padre actualizado exitosamente', data: padre });
    } catch (error) {
        next(error);
    }
};

exports.deletePadre = async (req, res, next) => {
    try {
        const { id } = req.params;
        const padre = await Padre.findByPk(id);
        if (!padre) {
            return res.status(404).json({ success: false, message: 'Padre no encontrado' });
        }
        await padre.destroy();
        res.json({ success: true, message: 'Padre eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

exports.vincularEstudiante = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estudiante_id } = req.body;

        const padre = await Padre.findByPk(id);
        if (!padre) {
            return res.status(404).json({ success: false, message: 'Padre no encontrado' });
        }

        const estudiante = await Estudiante.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        if (estudiante.padre_id && estudiante.padre_id !== parseInt(id)) {
            return res.status(409).json({
                success: false,
                message: `${estudiante.nombre_completo} ya está vinculado a otro tutor`
            });
        }

        await estudiante.update({ padre_id: id });

        res.json({
            success: true,
            message: `${estudiante.nombre_completo} vinculado correctamente a ${padre.nombre_completo}`,
            data: estudiante
        });
    } catch (error) {
        next(error);
    }
};