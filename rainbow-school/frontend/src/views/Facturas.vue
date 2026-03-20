<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Facturas</h1>
        <p>Control de facturas semanales y estado de pagos</p>
      </div>
      <button class="btn btn-teal btn-lg" @click="showGenerar=true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
        Generar Factura
      </button>
    </div>

  
    <div class="grid-3 mb-6">
      <div class="stat-card stat-amber"><div class="stat-val">{{ pendientes.length }}</div><div class="stat-lbl">Facturas pendientes</div></div>
      <div class="stat-card stat-teal"><div class="stat-val">{{ pagadas.length }}</div><div class="stat-lbl">Facturas pagadas</div></div>
      <div class="stat-card stat-violet"><div class="stat-val">L {{ fNum(totalPendiente) }}</div><div class="stat-lbl">Monto pendiente</div></div>
    </div>

   
    <div class="card">
      <div class="flex gap-4 items-center mb-4">
        <input v-model="busqueda" class="input" placeholder="Buscar por estudiante o N° factura..." style="flex:1;max-width:320px;"/>
        <select v-model="filtroEstado" class="select" style="width:160px;">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>
      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Estudiante</th>
              <th>Período</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Emisión</th>
              <th>Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in facturasFiltradas" :key="f.id" :class="{ 'row-anulada': f.estado==='anulada' }">
              <td><code class="code-chip">{{ f.numero_factura ?? `#${String(f.id).padStart(4,'0')}` }}</code></td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="av-sm" :style="{ background: avatarColor(f.estudiante?.nombre_completo) }">{{ initials(f.estudiante?.nombre_completo) }}</div>
                  <div>
                    <div class="font-bold" style="font-size:0.82rem;">{{ f.estudiante?.nombre_completo ?? `Est. #${f.estudiante_id}` }}</div>
                    <div class="text-sm text-muted">{{ f.estudiante?.grado ?? '' }}</div>
                  </div>
                </div>
              </td>
              <td class="text-sm text-muted">{{ fFecha(f.fecha_inicio) }} – {{ fFecha(f.fecha_fin) }}</td>
              <td><strong>L {{ fNum(f.total) }}</strong></td>
              <td><span :class="['badge', estadoBadge(f.estado)]">{{ f.estado }}</span></td>
              <td class="text-sm text-muted">{{ fFechaLarga(f.fecha_emision ?? f.created_at) }}</td>
              <td class="text-sm text-muted">{{ f.fecha_pago ? fFecha(f.fecha_pago) : '—' }}</td>
              <td>
                <div class="flex gap-2">
                  <button v-if="f.estado==='pendiente'" class="btn btn-teal btn-sm" @click="confirmarPago(f)">✓ Pagar</button>
                  <button v-if="f.estado==='pendiente'" class="btn btn-ghost btn-sm" @click="confirmarAnular(f)">Anular</button>
                  <button class="btn btn-ghost btn-sm" @click="verDetalle(f)">👁</button>
                </div>
              </td>
            </tr>
            <tr v-if="!facturasFiltradas.length">
              <td colspan="8"><div class="empty-state"><span>No hay facturas para mostrar</span></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div v-for="i in 4" :key="i" class="skeleton mb-3" style="height:56px;"></div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showGenerar" @click.self="showGenerar=false">
      <div class="modal" style="max-width:460px;">
        <div class="modal-header">
          <div><h2>Generar Factura Semanal</h2><p>Agrupa los consumos no facturados del período</p></div>
          <button class="btn btn-ghost btn-sm" @click="showGenerar=false">✕</button>
        </div>
        <div class="flex flex-col gap-4">
          <div class="form-group">
            <label>Estudiante *</label>
            <select v-model="genForm.estudiante_id" class="select">
              <option value="">Selecciona un estudiante</option>
              <option v-for="e in estudiantes" :key="e.id" :value="e.id">{{ e.nombre_completo }}</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Fecha inicio *</label><input v-model="genForm.fecha_inicio" type="date" class="input"/></div>
            <div class="form-group"><label>Fecha fin *</label><input v-model="genForm.fecha_fin" type="date" class="input"/></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showGenerar=false">Cancelar</button>
          <button class="btn btn-teal" @click="generar" :disabled="!genForm.estudiante_id||!genForm.fecha_inicio||!genForm.fecha_fin||guardando">
            {{ guardando ? 'Generando…' : 'Generar Factura' }}
          </button>
        </div>
      </div>
    </div>

  
    <div class="modal-backdrop" v-if="showPago" @click.self="showPago=false">
      <div class="modal" style="max-width:400px;">
        <div class="modal-header"><h2>Confirmar pago</h2><button class="btn btn-ghost btn-sm" @click="showPago=false">✕</button></div>
        <p>Registrar el pago de <strong>L {{ fNum(target?.total) }}</strong> — {{ target?.numero_factura }}</p>
        <div class="form-group mt-4">
          <label>Método de pago</label>
          <select v-model="metodoPago" class="select">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showPago=false">Cancelar</button>
          <button class="btn btn-teal" @click="pagar">✓ Confirmar pago</button>
        </div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showAnular" @click.self="showAnular=false">
      <div class="modal" style="max-width:400px;">
        <div class="modal-header"><h2>¿Anular factura?</h2><button class="btn btn-ghost btn-sm" @click="showAnular=false">✕</button></div>
        <p>Se anulará la factura <strong>{{ target?.numero_factura }}</strong>. Los consumos quedarán liberados.</p>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showAnular=false">Cancelar</button>
          <button class="btn btn-coral" @click="anular">Sí, anular</button>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" v-if="showDetalle && target" @click.self="showDetalle=false">
      <div class="modal" style="max-width:540px;">
        <div class="modal-header">
          <div>
            <h2>{{ target.numero_factura ?? `Factura #${target.id}` }}</h2>
            <p>{{ target.estudiante?.nombre_completo }} · {{ fFecha(target.fecha_inicio) }} – {{ fFecha(target.fecha_fin) }}</p>
          </div>
          <span :class="['badge', estadoBadge(target.estado)]">{{ target.estado }}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              <tr v-for="d in detalleActual" :key="d.id">
                <td>{{ d.consumo?.producto?.nombre ?? d.consumo_id }}</td>
                <td>{{ d.consumo?.cantidad }}</td>
                <td>L {{ fNum(d.consumo?.precio_unitario) }}</td>
                <td><strong>L {{ fNum(d.consumo?.subtotal) }}</strong></td>
              </tr>
              <tr v-if="!detalleActual.length">
                <td colspan="4" style="text-align:center;padding:16px;color:var(--c-ink-faint);">Sin detalle cargado</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--c-bg);border-radius:var(--r-md);margin-top:12px;">
          <span style="font-family:var(--font-display);font-weight:700;">Total</span>
          <span style="font-family:var(--font-display);font-weight:800;font-size:1.15rem;color:var(--c-teal);">L {{ fNum(target.total) }}</span>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" @click="showDetalle=false">Cerrar</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { facturasService, estudiantesService } from '@/services/api.js'

const showToast = inject('showToast')
const loading = ref(true)
const facturas = ref([])
const estudiantes = ref([])
const busqueda = ref('')
const filtroEstado = ref('')
const showGenerar = ref(false)
const showPago = ref(false)
const showAnular = ref(false)
const showDetalle = ref(false)
const target = ref(null)
const detalleActual = ref([])
const guardando = ref(false)
const metodoPago = ref('efectivo')
const genForm = ref({ estudiante_id: '', fecha_inicio: '', fecha_fin: '' })

const pendientes = computed(() => facturas.value.filter(f => f.estado === 'pendiente'))
const pagadas    = computed(() => facturas.value.filter(f => f.estado === 'pagada'))
const totalPendiente = computed(() => pendientes.value.reduce((s,f) => s + Number(f.total ?? 0), 0))
const facturasFiltradas = computed(() => {
  let lista = facturas.value
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(f =>
      (f.estudiante?.nombre_completo ?? '').toLowerCase().includes(q) ||
      (f.numero_factura ?? '').toLowerCase().includes(q) ||
      String(f.id).includes(q)
    )
  }
  if (filtroEstado.value) lista = lista.filter(f => f.estado === filtroEstado.value)
  return lista
})

function fNum(n) { return Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 }) }
function fFecha(d) { if (!d) return '—'; return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('es-HN', { day: '2-digit', month: 'short' }) }
function fFechaLarga(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' }) }
function initials(n) { return (n ?? '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }
const COLORS = ['#F5A623','#0D9B8C','#7B5EA7','#F0533A','#2E86C1']
function avatarColor(n) { return COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length] }
function estadoBadge(e) { return e === 'pagada' ? 'badge-teal' : e === 'anulada' ? 'badge-gray' : 'badge-amber' }

function confirmarPago(f) { target.value = f; metodoPago.value = 'efectivo'; showPago.value = true }
function confirmarAnular(f) { target.value = f; showAnular.value = true }
async function verDetalle(f) {
  target.value = f; detalleActual.value = []
  try {
    const res = await facturasService.getById(f.id)
    const data = res.data?.data ?? f
    detalleActual.value = data.detalles ?? []
  } catch {}
  showDetalle.value = true
}

async function cargar() {
  loading.value = true
  try { const res = await facturasService.getAll(); facturas.value = res.data?.data ?? [] }
  catch { console.error('Error cargando facturas') }
  loading.value = false
}

async function generar() {
  guardando.value = true
  try {
    await facturasService.generar(genForm.value)
    showToast('Factura generada correctamente', 'success')
    showGenerar.value = false; genForm.value = { estudiante_id: '', fecha_inicio: '', fecha_fin: '' }; cargar()
  } catch (err) {
    showToast(err.response?.data?.message ?? 'Error al generar factura', 'error')
  }
  guardando.value = false
}

async function pagar() {
  try {
    await facturasService.pagar(target.value.id, { metodo_pago: metodoPago.value })
    showToast('Pago registrado correctamente', 'success')
    showPago.value = false; cargar()
  } catch (err) { showToast(err.response?.data?.message ?? 'Error al registrar pago', 'error') }
}

async function anular() {
  try {
    await facturasService.anular(target.value.id)
    showToast('Factura anulada', 'success')
    showAnular.value = false; cargar()
  } catch (err) { showToast(err.response?.data?.message ?? 'Error al anular', 'error') }
}

onMounted(async () => {
  await cargar()
  try { const r = await estudiantesService.getAll(); estudiantes.value = r.data?.data ?? [] } catch {}
})
</script>

<style scoped>
.stat-card { border-radius: var(--r-lg); padding: var(--sp-5); border: 1px solid var(--c-border); }
.stat-amber  { background: var(--c-primary-lt); }
.stat-teal   { background: var(--c-sage-lt); }
.stat-violet { background: var(--c-lilac-lt); }
.stat-val { font-family: var(--font-display); font-weight: 800; font-size: 1.4rem; }
.stat-lbl { font-size: 0.75rem; color: var(--c-ink-soft); margin-top: 3px; }
.av-sm { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 0.65rem; color: #fff; flex-shrink: 0; }
.code-chip { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 4px; padding: 2px 8px; font-size: 0.74rem; color: var(--c-ink-soft); }
.row-anulada td { opacity: .45; }
.btn-teal { background: var(--c-sage); color: #fff; }
.btn-teal:hover { background: #005f55; }
.btn-coral { background: var(--c-coral); color: #fff; }
.btn-coral:hover { background: #d94430; }
</style>
