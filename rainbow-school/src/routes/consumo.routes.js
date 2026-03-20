const express = require('express');
const router  = express.Router();
const ctrl    = require('../models/controllers/consumo.controller');
const {
    writeLimiter,
    validateConsumo, validateId,
    handleValidationErrors
} = require('../models/middleware/security.middleware');

router.get('/',                    ctrl.getConsumos);
router.get('/semanales/:id',       validateId, handleValidationErrors, ctrl.getConsumosSemanales);
router.get('/:id',                 validateId, handleValidationErrors, ctrl.getConsumoById);
router.post('/',                   writeLimiter, validateConsumo, handleValidationErrors, ctrl.registrarConsumo);
router.delete('/:id',              writeLimiter, validateId, handleValidationErrors, ctrl.deleteConsumo);

module.exports = router;
