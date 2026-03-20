const express = require('express');
const router  = express.Router();
const ctrl    = require('../models/controllers/factura.controller');
const {
    writeLimiter,
    validateFactura, validateId,
    handleValidationErrors
} = require('../models/middleware/security.middleware');

router.get('/',                    ctrl.getAllFacturas);
router.get('/estudiante/:id',      validateId, handleValidationErrors, ctrl.getFacturasByEstudiante);
router.get('/:id',                 validateId, handleValidationErrors, ctrl.getFacturaById);
router.post('/generar',            writeLimiter, validateFactura, handleValidationErrors, ctrl.generarFacturaSemanal);
router.put('/:id/pagar',           writeLimiter, validateId, handleValidationErrors, ctrl.registrarPago);
router.put('/:id/anular',          writeLimiter, validateId, handleValidationErrors, ctrl.anularFactura);

module.exports = router;
