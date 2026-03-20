const express = require('express');
const router  = express.Router();
const ctrl    = require('../models/controllers/estudiante.controller');
const {
    writeLimiter,
    validateEstudiante, validateEstudianteUpdate,
    validateId, validateBusqueda,
    handleValidationErrors
} = require('../models/middleware/security.middleware');

router.get('/',          ctrl.getAllEstudiantes);
router.get('/buscar',    validateBusqueda, handleValidationErrors, ctrl.buscarEstudiantes);
router.get('/:id',       validateId, handleValidationErrors, ctrl.getEstudianteById);
router.post('/',         writeLimiter, validateEstudiante, handleValidationErrors, ctrl.createEstudiante);
router.put('/:id',       writeLimiter, validateEstudianteUpdate, handleValidationErrors, ctrl.updateEstudiante);
router.delete('/:id',    writeLimiter, validateId, handleValidationErrors, ctrl.deleteEstudiante);

module.exports = router;
