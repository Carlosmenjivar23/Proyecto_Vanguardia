const express = require('express');
const router = express.Router();
const dashboardController = require('../models/controllers/dashboard.controller');

router.get('/resumen', dashboardController.getResumen);
router.get('/consumos-diarios', dashboardController.getConsumosDiarios);
router.get('/top-productos', dashboardController.getTopProductos);
router.get('/top-estudiantes', dashboardController.getTopEstudiantes);

module.exports = router;