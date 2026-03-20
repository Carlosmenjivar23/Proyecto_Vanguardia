const errorHandler = (err, req, res, next) => {
    
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message);

    let status  = 500;
    let message = 'Error interno del servidor';

  
    if (err.name === 'SequelizeValidationError') {
        status  = 400;
        message = err.errors.map(e => e.message).join(', ');
    }
  
    else if (err.name === 'SequelizeUniqueConstraintError') {
        status  = 409;
        message = 'El registro ya existe en el sistema';
    }
    
    else if (err.parent?.sqlState === '45000' || err.sqlState === '45000') {
        status  = 400;
    
        message = err.parent?.sqlMessage || err.message;
    }
   
    else if (err.parent?.code === 'ER_ROW_IS_REFERENCED_2') {
        status  = 409;
        message = 'No se puede eliminar: el registro está siendo utilizado';
    }
    
    else if (err.message?.includes('CORS')) {
        status  = 403;
        message = 'Acceso no permitido';
    }
    
    else if (err.type === 'entity.parse.failed') {
        status  = 400;
        message = 'Formato de datos inválido';
    }
    
    else if (err.type === 'entity.too.large') {
        status  = 413;
        message = 'La solicitud supera el tamaño permitido';
    }

  
    res.status(status).json({
        success: false,
        message,
        
        ...(process.env.NODE_ENV === 'development' && status === 500 && {
            debug: err.message
        })
    });
};

module.exports = { errorHandler };
