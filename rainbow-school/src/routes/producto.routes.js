const express = require('express');
const router  = express.Router();
const ctrl    = require('../models/controllers/producto.controller');
const {
    writeLimiter,
    validateProducto, validateId,
    handleValidationErrors
} = require('../models/middleware/security.middleware');

router.get('/',           ctrl.getAllProductos);
router.get('/categorias', ctrl.getAllCategorias);
router.get('/:id',        validateId, handleValidationErrors, ctrl.getProductoById);
router.post('/',          writeLimiter, validateProducto, handleValidationErrors, ctrl.createProducto);
router.put('/:id',        writeLimiter, validateId, handleValidationErrors, ctrl.updateProducto);
router.delete('/:id',     writeLimiter, validateId, handleValidationErrors, ctrl.deleteProducto);

module.exports = router;
