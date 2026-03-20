import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)


export const estudiantesService = {
  getAll:     ()          => api.get('/estudiantes'),
  getById:    id          => api.get(`/estudiantes/${id}`),
  buscar:     termino     => api.get(`/estudiantes/buscar?termino=${termino}`),
  crear:      data        => api.post('/estudiantes', data),
  actualizar: (id, data)  => api.put(`/estudiantes/${id}`, data),
  eliminar:   id          => api.delete(`/estudiantes/${id}`)
}


export const padresService = {
  getAll:             ()             => api.get('/padres'),
  getById:            id             => api.get(`/padres/${id}`),
  crear:              data           => api.post('/padres', data),
  actualizar:         (id, data)     => api.put(`/padres/${id}`, data),
  eliminar:           id             => api.delete(`/padres/${id}`),
  vincularEstudiante: (padreId, estId) => api.post(`/padres/${padreId}/vincular`, { estudiante_id: estId })
}

export const productosService = {
  getAll:       ()          => api.get('/productos'),
  getCategorias:()          => api.get('/productos/categorias'),
  crear:        data        => api.post('/productos', data),
  actualizar:   (id, data)  => api.put(`/productos/${id}`, data),
  eliminar:     id          => api.delete(`/productos/${id}`)
}

export const consumosService = {
  getAll:       (params)        => api.get('/consumos', { params }),
  getById:      id              => api.get(`/consumos/${id}`),
  getSemanales: estudiante_id   => api.get(`/consumos/semanales/${estudiante_id}`),
  registrar:    data            => api.post('/consumos', data),
  eliminar:     id              => api.delete(`/consumos/${id}`)
}


export const facturasService = {
  getAll:           ()          => api.get('/facturas'),
  getById:          id          => api.get(`/facturas/${id}`),
  getByEstudiante:  eid         => api.get(`/facturas/estudiante/${eid}`),
  generar:          data        => api.post('/facturas/generar', data),
  pagar:            (id, data)  => api.put(`/facturas/${id}/pagar`, data || {}),
  anular:           id          => api.put(`/facturas/${id}/anular`)
}


export const dashboardService = {
  resumen:          () => api.get('/dashboard/resumen'),
  consumosDiarios:  () => api.get('/dashboard/consumos-diarios'),
  topProductos:     () => api.get('/dashboard/top-productos'),
  topEstudiantes:   () => api.get('/dashboard/top-estudiantes')
}

export default api
