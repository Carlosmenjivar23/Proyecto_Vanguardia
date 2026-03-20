const express = require('express');
const router  = express.Router();
const ctrl    = require('../models/controllers/padre.controller');
const {
    writeLimiter,
    validatePadre, validateId,
    handleValidationErrors
} = require('../models/middleware/security.middleware');

router.get('/',       ctrl.getAllPadres);
router.get('/:id',    validateId, handleValidationErrors, ctrl.getPadreById);
router.post('/',      writeLimiter, validatePadre, handleValidationErrors, ctrl.createPadre);
router.put('/:id',    writeLimiter, validateId, handleValidationErrors, ctrl.updatePadre);
router.delete('/:id', writeLimiter, validateId, handleValidationErrors, ctrl.deletePadre);

module.exports = router;

router.post('/:id/vincular', writeLimiter, validateId, handleValidationErrors, ctrl.vincularEstudiante);
