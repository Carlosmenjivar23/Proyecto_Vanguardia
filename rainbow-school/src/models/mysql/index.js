const Estudiante = require('./Estudiante.model');
const Padre = require('./Padre.model');
const Producto = require('./Producto.model');
const Categoria = require('./Categoria.model');
const Consumo = require('./Consumo.model');
const Factura = require('./Factura.model');
const DetalleFactura = require('./DetalleFactura.model');
const Configuracion = require('./Configuracion.model');

Padre.hasMany(Estudiante, { foreignKey: 'padre_id', as: 'estudiantes' });
Estudiante.belongsTo(Padre, { foreignKey: 'padre_id', as: 'padre' });

Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });


Estudiante.hasMany(Consumo, { foreignKey: 'estudiante_id', as: 'consumos' });
Consumo.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });

Producto.hasMany(Consumo, { foreignKey: 'producto_id', as: 'consumos' });
Consumo.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

Factura.hasMany(Consumo, { foreignKey: 'factura_id', as: 'consumos' });
Consumo.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura' });

Estudiante.hasMany(Factura, { foreignKey: 'estudiante_id', as: 'facturas' });
Factura.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });


Factura.hasMany(DetalleFactura, { foreignKey: 'factura_id', as: 'detalles' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura' });

DetalleFactura.belongsTo(Consumo, { foreignKey: 'consumo_id', as: 'consumo' });

module.exports = {
    Estudiante,
    Padre,
    Producto,
    Categoria,
    Consumo,
    Factura,
    DetalleFactura,
    Configuracion
};