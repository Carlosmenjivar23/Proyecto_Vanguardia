<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema de crédito escolar</p>
      </div>
      <div class="flex gap-3 items-center">
        <span class="text-sm text-muted">{{ fechaHoy }}</span>
        <button class="btn btn-primary" @click="cargar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Actualizar
        </button>
      </div>
    </div>

    <div class="grid-4 mb-6" v-if="!loading">
      <div class="kpi-card kpi-amber">
        <div class="kpi-icon">💰</div>
        <div class="kpi-val">L {{ fNum(resumen.credito_disponible_total) }}</div>
        <div class="kpi-lbl">Crédito disponible total</div>
      </div>
      <div class="kpi-card kpi-coral">
        <div class="kpi-icon">📋</div>
        <div class="kpi-val">{{ resumen.facturas_pendientes ?? 0 }}</div>
        <div class="kpi-lbl">Facturas pendientes</div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-icon">🛒</div>
        <div class="kpi-val">L {{ fNum(resumen.consumos_hoy) }}</div>
        <div class="kpi-lbl">Consumido hoy</div>
      </div>
      <div class="kpi-card kpi-violet">
        <div class="kpi-icon">🎓</div>
        <div class="kpi-val">{{ resumen.total_estudiantes ?? 0 }}</div>
        <div class="kpi-lbl">Estudiantes activos</div>
      </div>
    </div>
    <div class="grid-4 mb-6" v-else>
      <div v-for="i in 4" :key="i" class="skeleton" style="height:110px;border-radius:20px;"></div>
    </div>

    <div class="grid-2 mb-6">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div><h2>Consumos últimos 7 días</h2><p class="text-sm">Total en lempiras</p></div>
          <span class="badge badge-amber">Semanal</span>
        </div>
        <canvas ref="chartRef" style="height:160px;" v-if="!loading"></canvas>
        <div v-else class="skeleton" style="height:180px;border-radius:8px;"></div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div><h2>Top Productos</h2><p class="text-sm">Últimos 30 días</p></div>
          <span class="badge badge-teal">Top 5</span>
        </div>
        <div v-if="!loading" class="top-list">
          <div v-for="(p, i) in topProductos" :key="p.id" class="top-item">
            <div class="top-rank" :class="`rank-${i+1}`">{{ i+1 }}</div>
            <div class="top-info">
              <span class="top-name">{{ p.nombre }}</span>
              <span class="top-meta">{{ p.total_ventas ?? 0 }} ventas · L {{ fNum(p.total_gastado) }}</span>
            </div>
            <div class="top-bar-wrap">
              <div class="top-bar" :style="{ width: pct(p.total_ventas, topProductos, 'total_ventas') + '%' }"></div>
            </div>
          </div>
          <div v-if="!topProductos.length" class="empty-state" style="padding:20px;">Sin datos</div>
        </div>
        <div v-else>
          <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:32px;"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <div><h2>Top Estudiantes</h2><p class="text-sm">Mayor consumo en los últimos 30 días</p></div>
        <span class="badge badge-violet">Top 5</span>
      </div>
      <div class="table-wrap" v-if="!loading">
        <table>
          <thead><tr><th>#</th><th>Estudiante</th><th>Grado / Sección</th><th>Consumos</th><th>Total gastado</th></tr></thead>
          <tbody>
            <tr v-for="(e, i) in topEstudiantes" :key="e.id">
              <td><span class="rank-dot" :class="`rank-${i+1}`">{{ i+1 }}</span></td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar-sm" :style="{ background: avatarColor(e.nombre_completo) }">{{ initials(e.nombre_completo) }}</div>
                  <span class="font-bold">{{ e.nombre_completo }}</span>
                </div>
              </td>
              <td>{{ e.grado ?? '—' }}{{ e.seccion ? ' · ' + e.seccion : '' }}</td>
              <td>{{ e.total_consumos }}</td>
              <td><strong>L {{ fNum(e.total_gastado) }}</strong></td>
            </tr>
            <tr v-if="!topEstudiantes.length">
              <td colspan="5" class="empty-state">Sin datos de consumo disponibles</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:48px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { dashboardService } from '@/services/api.js'
import Chart from 'chart.js/auto'

const loading = ref(true)
const resumen = ref({})
const topProductos = ref([])
const topEstudiantes = ref([])
const chartRef = ref(null)
let chartInstance = null

const fechaHoy = new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

function fNum(n) {
  if (n === null || n === undefined || n === '') return '0.00'
  return Number(n).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function initials(n) { return (n ?? '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }
const COLORS = ['#F5A623','#0D9B8C','#7B5EA7','#F0533A','#2E86C1']
function avatarColor(n) { return COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length] }
function pct(val, list, key) {
  const max = Math.max(...list.map(p => Number(p[key] ?? 0)), 1)
  return Math.round((Number(val ?? 0) / max) * 100)
}

function renderChart(datos) {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()
  const labels = datos.map(d => {
    const f = d.fecha_consumo
    if (!f) return ''
    return new Date(f + 'T00:00:00').toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric' })
  })
  const values = datos.map(d => Number(d.total_gastado ?? 0))
  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'L', data: values, backgroundColor: 'rgba(245,166,35,0.85)', borderRadius: 8, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'DM Sans', size: 11 }, callback: v => 'L' + v } },
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } }
      }
    }
  })
}

async function cargar() {
  loading.value = true
  try {
    const [r, cd, tp, te] = await Promise.allSettled([
      dashboardService.resumen(),
      dashboardService.consumosDiarios(),
      dashboardService.topProductos(),
      dashboardService.topEstudiantes()
    ])
    resumen.value        = r.status  === 'fulfilled' ? (r.value.data?.data   ?? {})  : {}
    const consumos       = cd.status === 'fulfilled' ? (cd.value.data?.data  ?? [])  : []
    topProductos.value   = tp.status === 'fulfilled' ? (tp.value.data?.data  ?? [])  : []
    topEstudiantes.value = te.status === 'fulfilled' ? (te.value.data?.data  ?? [])  : []
    await nextTick()
    renderChart(consumos)
  } catch {}
  loading.value = false
}

onMounted(cargar)
</script>

<style scoped>
.kpi-card { border-radius: var(--r-md); padding: var(--sp-4) var(--sp-5); border: 1px solid var(--c-border); }
.kpi-amber  { background: var(--c-primary-lt); border-color: var(--c-border); }
.kpi-coral  { background: var(--c-mauve-lt);  border-color: var(--c-border); }
.kpi-teal   { background: var(--c-sage-lt);   border-color: var(--c-border); }
.kpi-violet { background: var(--c-lilac-lt);  border-color: var(--c-border); }
.kpi-icon { font-size: 1.5rem; margin-bottom: var(--sp-2); }
.kpi-val  { font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--c-ink); line-height: 1; margin-bottom: 4px; }
.kpi-lbl  { font-size: 0.75rem; color: var(--c-ink-soft); }
.top-list { display: flex; flex-direction: column; gap: var(--sp-3); }
.top-item { display: flex; align-items: center; gap: var(--sp-3); }
.top-rank { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; font-family: var(--font-display); flex-shrink: 0; }
.rank-1 { background: var(--c-amber);  color: #fff; } .rank-2 { background: var(--c-teal); color: #fff; } .rank-3 { background: var(--c-violet); color: #fff; } .rank-4,.rank-5 { background: var(--c-border); color: var(--c-ink-soft); }
.top-info { flex: 0 0 140px; display: flex; flex-direction: column; }
.top-name { font-size: 0.8rem; font-weight: 600; }
.top-meta { font-size: 0.68rem; color: var(--c-ink-soft); }
.top-bar-wrap { flex: 1; height: 5px; background: var(--c-border); border-radius: 3px; overflow: hidden; }
.top-bar { height: 100%; background: var(--c-amber); border-radius: 3px; }
.rank-dot { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; font-family: var(--font-display); }
.avatar-sm { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 0.68rem; color: #fff; flex-shrink: 0; }
</style>
