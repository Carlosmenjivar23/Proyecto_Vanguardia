import { createRouter, createWebHistory } from 'vue-router'
import Dashboard   from '@/views/Dashboard.vue'
import Estudiantes from '@/views/Estudiantes.vue'
import Consumos    from '@/views/Consumos.vue'
import Facturas    from '@/views/Facturas.vue'
import Productos   from '@/views/Productos.vue'
import Padres      from '@/views/Padres.vue'

const routes = [
  { path: '/',              redirect: '/dashboard' },
  { path: '/dashboard',     component: Dashboard,   meta: { title: 'Dashboard' } },
  { path: '/estudiantes',   component: Estudiantes, meta: { title: 'Estudiantes' } },
  { path: '/consumos',      component: Consumos,    meta: { title: 'Consumos' } },
  { path: '/facturas',      component: Facturas,    meta: { title: 'Facturas' } },
  { path: '/productos',     component: Productos,   meta: { title: 'Productos' } },
  { path: '/padres',        component: Padres,      meta: { title: 'Padres' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach(to => {
  document.title = `${to.meta.title || 'App'} · Rainbow School`
})

export default router
