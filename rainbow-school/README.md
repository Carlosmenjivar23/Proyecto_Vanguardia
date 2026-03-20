#  Rainbow School · Credit Control

Sistema fullstack de control de crédito escolar.
**Vue 3 + Node.js / Express + MySQL**

---

## Instalación rápida

```bash
# 1. Configurar variables de entorno
cp .env
# Edita .env con tu host, usuario y contraseña de MySQL

# 2. Instalar dependencias y compilar el frontend
npm run setup

# 3. Arrancar
npm start
# → http://localhost:3000
```

---

##  Modo desarrollo (hot-reload)

Abre dos terminales:

```bash
# Terminal 1 — Backend (auto-reinicio con nodemon)
npm run dev

# Terminal 2 — Frontend (hot-reload con Vite)
npm run dev:frontend
# → http://localhost:5173
```

> En modo desarrollo, Vite hace proxy automático de `/api` hacia el backend en `:3000`.

---

##  Variables de entorno (`.env`)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=educredit_db
```

---

##  Base de datos — Stored Procedures requeridos

Descargue la base de datos e importela a su MYSQL WorkBench

##  Estructura del proyecto

```
rainbow-school/
├── server.js                        # Punto de entrada
├── package.json                     # Scripts del proyecto completo
├── .env                             # Variables de entorno (no subir a git)
├── .env.example                     # Plantilla
│
├── src/                             # Backend Node.js
│   ├── app.js                       # Express: rutas API + sirve frontend/dist
│   ├── config/database.js           # Conexión Sequelize/MySQL
│   ├── models/
│   │   ├── mysql/                   # Modelos Sequelize (8 entidades)
│   │   ├── controllers/             # Lógica de negocio
│   │   └── middleware/              # Error handler
│   └── routes/                      # Rutas API REST
│
└── frontend/                        # Vue 3 + Vite
    ├── vite.config.js               # Proxy /api → :3000 en dev
    └── src/
        ├── main.js
        ├── App.vue                  # Shell con sidebar de navegación
        ├── router/index.js          # Vue Router
        ├── services/api.js          # Cliente Axios con todos los endpoints
        ├── assets/main.css          # Design system (colores, tipografía)
        └── views/
            ├── Dashboard.vue        # KPIs + gráficas + top productos/estudiantes
            ├── Estudiantes.vue      # CRUD + desactivar / reactivar
            ├── Consumos.vue         # Registro de consumos en 2 pasos
            ├── Facturas.vue         # Generar, pagar, anular + descarga como imagen
            ├── Productos.vue        # Catálogo de la cafetería
            └── Padres.vue           # Directorio de padres/tutores
```

---

##  API — `http://localhost:3000/api`

| Módulo | Endpoints destacados |
|---|---|
| `GET/POST /estudiantes` | Listar y crear — enviar `{ estudiante, padre }` |
| `PUT /estudiantes/:id` | Editar datos o cambiar estado |
| `DELETE /estudiantes/:id` | Desactiva si tiene historial, elimina si no |
| `GET/POST /padres` | CRUD completo de padres/tutores |
| `GET/POST /productos` | CRUD + `/categorias` |
| `POST /consumos` | Registrar consumo (usa stored procedure) |
| `POST /facturas/generar` | Generar factura semanal (stored procedure) |
| `PUT /facturas/:id/pagar` | Registrar pago con método |
| `PUT /facturas/:id/anular` | Anular factura pendiente |
| `GET /dashboard/resumen` | KPIs principales |
| `GET /dashboard/top-productos` | Top 5 productos más vendidos |
| `GET /dashboard/top-estudiantes` | Top 5 estudiantes por consumo |

---

## Pantallas

| Pantalla | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | KPIs, gráfica semanal, rankings |
| Estudiantes | `/estudiantes` | CRUD con estados: activo / suspendido / egresado / cancelado |
| Consumos | `/consumos` | Registro en 2 pasos: elegir estudiante → añadir productos |
| Facturas | `/facturas` | Generar, pagar, anular y **descargar como imagen PNG** |
| Productos | `/productos` | Catálogo con grid de cards por categoría |
| Padres | `/padres` | Directorio con búsqueda |

---

##  Scripts disponibles

```bash
npm run setup           # Instala todo y compila el frontend (primer uso)
npm start               # Producción — sirve frontend desde dist/
npm run dev             # Backend con nodemon (auto-reinicio)
npm run dev:frontend    # Frontend con Vite en :5173
npm run build:frontend  # Recompilar frontend después de cambios
npm run install:all     # Instalar dependencias backend + frontend
```

---

##  Notas importantes

- **Estudiantes con historial:** El botón eliminar desactiva en lugar de borrar para preservar consumos y facturas. Se pueden reactivar con el botón ▶.
- **Estados de estudiante:** `activo`, `suspendido`, `egresado`, `cancelado` — cambiables desde el formulario de edición o al desactivar.
- **Descarga de facturas:** Disponible como imagen PNG desde la tabla o desde el modal de detalle. Se genera con Canvas API sin dependencias externas.
- **Producción:** Siempre ejecutar `npm run build:frontend` después de modificar el frontend, luego `npm start`.