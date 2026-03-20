const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');


const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas solicitudes. Intenta en un momento.' }
});


const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Límite de operaciones alcanzado. Espera un momento.' }
});


function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}


function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = deepSanitize(req.body);
    }
    next();
}

function deepSanitize(obj) {
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj))      return obj.map(deepSanitize);
    if (obj && typeof obj === 'object') {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = deepSanitize(obj[key]);
        }
        return result;
    }
    return obj;
}


const validateEstudiante = [
    body('estudiante.nombre_completo')
        .trim().notEmpty().withMessage('Nombre del estudiante requerido')
        .isLength({ max: 100 }).withMessage('Nombre demasiado largo'),

    body('estudiante.identificacion')
        .trim().notEmpty().withMessage('Identificación requerida')
        .isLength({ max: 20 }).withMessage('Identificación demasiado larga')
        .matches(/^[a-zA-Z0-9\-]+$/).withMessage('Identificación inválida'),

    body('estudiante.credito_aprobado')
        .isFloat({ min: 0, max: 99999 }).withMessage('Crédito debe ser entre 0 y 99,999'),

    body('estudiante.grado')
        .optional().trim().isLength({ max: 50 }),

    body('padre.nombre_completo')
        .optional({ nullable: true, checkFalsy: true }).trim()
        .isLength({ max: 100 }).withMessage('Nombre demasiado largo'),

    body('padre.identificacion')
        .optional({ nullable: true, checkFalsy: true }).trim()
        .isLength({ max: 20 })
        .matches(/^[a-zA-Z0-9\-]+$/).withMessage('Identificación inválida'),

    body('padre.telefono')
        .optional({ nullable: true, checkFalsy: true }).trim()
        .isLength({ max: 20 }).withMessage('Teléfono demasiado largo'),
];

const validateEstudianteUpdate = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),

    body('nombre_completo')
        .optional().trim()
        .isLength({ max: 100 })
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/),

    body('identificacion')
        .optional().trim().isLength({ max: 20 })
        .matches(/^[a-zA-Z0-9\-]+$/),

    body('credito_aprobado')
        .optional().isFloat({ min: 0, max: 99999 }),

    body('estado')
        .optional().isIn(['activo', 'suspendido', 'egresado', 'cancelado'])
        .withMessage('Estado inválido'),
];


const validateProducto = [
    body('nombre')
        .trim().notEmpty().withMessage('Nombre del producto requerido')
        .isLength({ max: 100 }),

    body('codigo')
        .trim().notEmpty().withMessage('Código requerido')
        .isLength({ max: 20 })
        .matches(/^[a-zA-Z0-9\-_]+$/).withMessage('Código solo puede contener letras, números, guiones'),

    body('precio')
        .isFloat({ min: 0, max: 9999 }).withMessage('Precio debe ser entre 0 y 9,999'),

    body('estado')
        .optional()
        .isIn(['disponible', 'agotado', 'descontinuado']).withMessage('Estado inválido'),

    body('categoria_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('Categoría inválida'),
];


const validateConsumo = [
    body('estudiante_id').isInt({ min: 1 }).withMessage('Estudiante inválido'),
    body('producto_id').isInt({ min: 1 }).withMessage('Producto inválido'),
    body('cantidad').isInt({ min: 1, max: 20 }).withMessage('Cantidad debe ser entre 1 y 20'),
    body('observaciones').optional().trim().isLength({ max: 500 }),
];


const validateFactura = [
    body('estudiante_id').isInt({ min: 1 }).withMessage('Estudiante inválido'),
    body('fecha_inicio').isDate().withMessage('Fecha de inicio inválida'),
    body('fecha_fin')
        .isDate().withMessage('Fecha fin inválida')
        .custom((val, { req }) => {
            if (new Date(val) < new Date(req.body.fecha_inicio)) {
                throw new Error('Fecha fin no puede ser anterior a fecha inicio');
            }
            return true;
        }),
];


const validatePadre = [
    body('nombre_completo')
        .trim().notEmpty().withMessage('Nombre requerido')
        .isLength({ max: 100 })
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/),

    body('identificacion')
        .trim().notEmpty().withMessage('Identificación requerida')
        .isLength({ max: 20 })
        .matches(/^[a-zA-Z0-9\-]+$/),

    body('telefono')
        .optional().trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .isLength({ max: 20 }),

    body('email')
        .optional().trim()
        .isEmail().withMessage('Email inválido')
        .isLength({ max: 100 })
        .normalizeEmail(),
];


const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
];


const validateBusqueda = [
    query('termino')
        .trim().notEmpty().withMessage('Término de búsqueda requerido')
        .isLength({ min: 2, max: 50 }).withMessage('Búsqueda debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]+$/).withMessage('Caracteres no válidos en búsqueda'),
];


function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,  
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
}

module.exports = {
    generalLimiter,
    writeLimiter,
    sanitizeBody,
    validateEstudiante,
    validateEstudianteUpdate,
    validateProducto,
    validateConsumo,
    validateFactura,
    validatePadre,
    validateId,
    validateBusqueda,
    handleValidationErrors,
};
