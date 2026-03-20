const app = require('./src/app');
const dotenv = require('dotenv');
const { testConnection } = require('./src/config/database');

dotenv.config();

const PORT = process.env.PORT || 3000;

testConnection();

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Entorno: ${process.env.NODE_ENV}`);
    console.log(`🔗 http://localhost:${PORT}`);
});