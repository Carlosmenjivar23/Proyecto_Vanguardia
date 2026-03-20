const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const hpp      = require('hpp');
const dotenv   = require('dotenv');
const path     = require('path');

const estudianteRoutes = require('./routes/estudiante.routes');
const padreRoutes      = require('./routes/padre.routes');
const productoRoutes   = require('./routes/producto.routes');
const consumoRoutes    = require('./routes/consumo.routes');
const facturaRoutes    = require('./routes/factura.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');

const { errorHandler } = require('./models/middleware/error.middleware');
const { generalLimiter, sanitizeBody } = require('./models/middleware/security.middleware');

dotenv.config();

const app = express();


app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:  ["'self'"],
            scriptSrc:   ["'self'", "'unsafe-inline'"],   
            styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
            imgSrc:      ["'self'", 'data:'],
            connectSrc:  ["'self'"],
        }
    },
    crossOriginEmbedderPolicy: false,  
}));


const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({
    origin: (origin, callback) => {
       
        if (!origin && process.env.NODE_ENV === 'development') return callback(null, true);
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Origen no permitido por CORS'));
    },
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));


app.use('/api', generalLimiter);


app.use(express.json({ limit: '50kb' }));           
app.use(express.urlencoded({ extended: true, limit: '50kb' }));


app.use(hpp());


app.use(sanitizeBody);


app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/padres',      padreRoutes);
app.use('/api/productos',   productoRoutes);
app.use('/api/consumos',    consumoRoutes);
app.use('/api/facturas',    facturaRoutes);
app.use('/api/dashboard',   dashboardRoutes);


const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
}));


app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


app.use(errorHandler);

module.exports = app;
