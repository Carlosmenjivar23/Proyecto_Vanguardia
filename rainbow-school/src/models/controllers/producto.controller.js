const { Producto, Categoria } = require('../mysql');

exports.getAllProductos = async (req, res, next) => {
    try {
        const productos = await Producto.findAll({
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }],
            order: [['nombre', 'ASC']]
        });
        
        res.json({ success: true, data: productos });
    } catch (error) {
        next(error);
    }
};

exports.getProductoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id, {
            include: [{ model: Categoria, as: 'categoria' }]
        });
        
        if (!producto) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, data: producto });
    } catch (error) {
        next(error);
    }
};

exports.createProducto = async (req, res, next) => {
    try {
        const producto = await Producto.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: producto
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        await producto.update(req.body);
        
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: producto
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        await producto.destroy();
        
        res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

exports.getAllCategorias = async (req, res, next) => {
    try {
        const categorias = await Categoria.findAll({
            order: [['nombre', 'ASC']]
        });
        
        res.json({ success: true, data: categorias });
    } catch (error) {
        next(error);
    }
};