<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Estudiantes</h1>
        <p>Gestión de estudiantes y crédito disponible</p>
      </div>
      <button class="btn btn-primary" @click="abrirNuevo">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Estudiante
      </button>
    </div>

    
    <div class="card mb-4">
      <div class="flex gap-4 items-center">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="busqueda" @input="onBusqueda" class="input search-input" placeholder="Buscar por nombre o identificación..."/>
        </div>
        <select v-model="filtroEstado" class="select" style="width:160px;">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="suspendido">Suspendidos</option>
          <option value="egresado">Egresados</option>
          <option value="cancelado">Cancelados</option>
        </select>
        <div class="text-sm text-muted" style="margin-left:auto;">Total: <strong>{{ estudiantes.length }}</strong></div>
      </div>
    </div>

    
    <div class="card">
      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Identificación</th>
              <th>Grado</th>
              <th>Padre/Tutor</th>
              <th>Crédito aprobado</th>
              <th>Disponible</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in estudiantesFiltrados" :key="e.id" :class="{ 'row-inactivo': e.estado !== 'activo' }">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar-lg" :style="{ background: avatarColor(e.nombre_completo) }">{{ initials(e.nombre_completo) }}</div>
                  <span class="font-bold">{{ e.nombre_completo }}</span>
                </div>
              </td>
              <td><code class="code-chip">{{ e.identificacion }}</code></td>
              <td>{{ e.grado ?? '—' }}{{ e.seccion ? ' / ' + e.seccion : '' }}</td>
              <td>{{ e.padre?.nombre_completo ?? '—' }}</td>
              <td>L {{ fNum(e.credito_aprobado) }}</td>
              <td><span :class="['badge', creditoBadge(e.credito_disponible)]">L {{ fNum(e.credito_disponible) }}</span></td>
              <td><span :class="['badge', estadoBadge(e.estado)]">{{ ESTADOS_LABEL[e.estado] ?? e.estado }}</span></td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm" @click="editar(e)" title="Editar">✏️</button>
                  <button v-if="e.estado !== 'activo'" class="btn btn-teal btn-sm" @click="reactivar(e)">▶ Reactivar</button>
                  <button v-else class="btn btn-ghost btn-sm" @click="confirmarDesactivar(e)" title="Desactivar">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="!estudiantesFiltrados.length">
              <td colspan="8">
                <div class="empty-state">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span>No se encontraron estudiantes</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div v-for="i in 6" :key="i" class="skeleton mb-3" style="height:54px;"></div>
      </div>
    </div>

  
    <div class="modal-backdrop" v-if="showModal" @click.self="cerrar">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <div>
            <h2>{{ editando ? 'Editar Estudiante' : 'Nuevo Estudiante' }}</h2>
            <p>{{ editando ? 'Modifica los datos del estudiante' : 'El tutor se puede vincular luego desde Padres / Tutores' }}</p>
          </div>
          <button class="btn btn-ghost btn-sm" @click="cerrar">✕</button>
        </div>

        <div class="grid-2 gap-4">
          <div class="form-group" style="grid-column:1/-1;">
            <label>Nombre completo *</label>
            <input v-model="form.nombre_completo" class="input" placeholder="Nombre completo del estudiante"/>
          </div>
          <div class="form-group">
            <label>Identificación *</label>
            <input v-model="form.identificacion" class="input" placeholder="DNI o código escolar"/>
          </div>
          <div class="form-group">
            <label>Crédito aprobado (L) *</label>
            <input v-model.number="form.credito_aprobado" type="number" min="0" step="50" class="input" placeholder="500.00"/>
          </div>
          <div class="form-group">
            <label>Grado</label>
            <input v-model="form.grado" class="input" placeholder="Ej: 5to Primaria"/>
          </div>
          <div class="form-group">
            <label>Sección</label>
            <input v-model="form.seccion" class="input" placeholder="A, B, C..."/>
          </div>
          <div class="form-group" v-if="editando" style="grid-column:1/-1;">
            <label>Estado</label>
            <select v-model="form.estado" class="select">
              <option value="activo">✅ Activo</option>
              <option value="suspendido">⏸ Suspendido</option>
              <option value="egresado">🎓 Egresado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrar">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando…' : editando ? 'Actualizar' : 'Crear Estudiante' }}
          </button>
        </div>
      </div>
    </div>

  
    <div class="modal-backdrop" v-if="showConfirm" @click.self="showConfirm=false">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <h2>Desactivar estudiante</h2>
          <button class="btn btn-ghost btn-sm" @click="showConfirm=false">✕</button>
        </div>
        <p class="mb-4">Selecciona el motivo para <strong>{{ elimTarget?.nombre_completo }}</strong>:</p>
        <div class="estado-opts">
          <label v-for="op in ESTADOS_INACTIVOS" :key="op.value"
            :class="['estado-opt', nuevoEstado === op.value && 'selected']"
            @click="nuevoEstado = op.value">
            <span class="opt-icon">{{ op.icon }}</span>
            <div>
              <div style="font-weight:700;font-size:0.83rem;">{{ op.label }}</div>
              <div style="font-size:0.74rem;color:var(--c-ink-soft);">{{ op.desc }}</div>
            </div>
          </label>
        </div>
        <div style="background:var(--c-teal-lt);border:1px solid var(--c-border);border-radius:8px;padding:10px 12px;margin-top:14px;font-size:0.78rem;color:var(--c-ink-soft);">
          💡 El historial se conserva. Puedes reactivar con el botón ▶.
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showConfirm=false">Cancelar</button>
          <button class="btn btn-coral" @click="desactivar">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { estudiantesService } from '@/services/api.js'

const showToast    = inject('showToast')
const loading      = ref(true)
const estudiantes  = ref([])
const busqueda     = ref('')
const filtroEstado = ref('')
const showModal    = ref(false)
const showConfirm  = ref(false)
const editando     = ref(false)
const guardando    = ref(false)
const elimTarget   = ref(null)
const nuevoEstado  = ref('egresado')

const ESTADOS_LABEL    = { activo:'Activo', suspendido:'Suspendido', egresado:'Egresado', cancelado:'Cancelado' }
const ESTADOS_INACTIVOS = [
  { value:'suspendido', label:'Suspendido', icon:'⏸', desc:'Temporal, puede reincorporarse' },
  { value:'egresado',   label:'Egresado',   icon:'🎓', desc:'Finalizó su período escolar' },
  { value:'cancelado',  label:'Cancelado',  icon:'❌', desc:'Baja definitiva del sistema' },
]

const formVacio = () => ({
  nombre_completo:'', identificacion:'', grado:'',
  seccion:'', credito_aprobado:500, estado:'activo', _id:null
})
const form = ref(formVacio())

const estudiantesFiltrados = computed(() => {
  let lista = estudiantes.value
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(e =>
      (e.nombre_completo ?? '').toLowerCase().includes(q) ||
      (e.identificacion  ?? '').toLowerCase().includes(q)
    )
  }
  if (filtroEstado.value) lista = lista.filter(e => e.estado === filtroEstado.value)
  return lista
})

const fNum         = n => Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })
const initials     = n => (n ?? '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
const COLORS       = ['#C2185B','#880E4F','#AD1457','#7B1FA2','#00796B']
const avatarColor  = n => COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length]
const creditoBadge = v => !v || Number(v) <= 0 ? 'badge-coral' : Number(v) < 100 ? 'badge-amber' : 'badge-teal'
const estadoBadge  = e => e === 'activo' ? 'badge-teal' : e === 'suspendido' ? 'badge-amber' : e === 'cancelado' ? 'badge-coral' : 'badge-gray'

async function onBusqueda() {
  if (busqueda.value.length > 2) {
    try { estudiantes.value = (await estudiantesService.buscar(busqueda.value)).data?.data ?? [] } catch {}
  } else if (!busqueda.value) cargar()
}

async function cargar() {
  loading.value = true
  try { estudiantes.value = (await estudiantesService.getAll()).data?.data ?? [] } catch {}
  loading.value = false
}

function abrirNuevo() {
  editando.value  = false
  form.value      = formVacio()
  showModal.value = true
}

function editar(e) {
  editando.value = true
  form.value = {
    nombre_completo:  e.nombre_completo,
    identificacion:   e.identificacion,
    grado:            e.grado ?? '',
    seccion:          e.seccion ?? '',
    credito_aprobado: e.credito_aprobado,
    estado:           e.estado ?? 'activo',
    _id:              e.id
  }
  showModal.value = true
}

function cerrar() { showModal.value = false }
function confirmarDesactivar(e) { elimTarget.value = e; nuevoEstado.value = 'egresado'; showConfirm.value = true }

async function reactivar(e) {
  try {
    await estudiantesService.actualizar(e.id, { estado: 'activo' })
    showToast(`${e.nombre_completo} reactivado`, 'success')
    cargar()
  } catch { showToast('No se pudo reactivar', 'error') }
}

async function guardar() {
  if (!form.value.nombre_completo || !form.value.identificacion) {
    showToast('Nombre e identificación requeridos', 'error'); return
  }
  guardando.value = true
  try {
    if (editando.value) {
      await estudiantesService.actualizar(form.value._id, form.value)
      showToast('Estudiante actualizado', 'success')
    } else {
      
      await estudiantesService.crear({ estudiante: form.value })
      showToast('Estudiante creado correctamente', 'success')
    }
    cerrar(); cargar()
  } catch (err) {
    showToast(err.response?.data?.message ?? 'Error al guardar', 'error')
  }
  guardando.value = false
}

async function desactivar() {
  try {
    await estudiantesService.actualizar(elimTarget.value.id, { estado: nuevoEstado.value })
    showToast(`${elimTarget.value.nombre_completo} marcado como ${ESTADOS_LABEL[nuevoEstado.value]}`, 'success')
    showConfirm.value = false; cargar()
  } catch { showToast('No se pudo cambiar el estado', 'error') }
}

onMounted(cargar)
</script>

<style scoped>
.search-wrap   { position:relative; flex:1; max-width:380px; }
.search-icon   { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--c-ink-faint); pointer-events:none; }
.search-input  { padding-left:34px; }
.avatar-lg     { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:0.75rem; color:#fff; flex-shrink:0; }
.code-chip     { background:var(--c-bg); border:1px solid var(--c-border); border-radius:4px; padding:2px 8px; font-size:0.74rem; color:var(--c-ink-soft); }
.row-inactivo td { opacity:.5; }
.mb-4 { margin-bottom:16px; }
.btn-teal  { background:var(--c-sage); color:#fff; font-size:0.72rem; padding:5px 10px; border-radius:var(--r-sm); }
.btn-teal:hover { background:#005f55; }
.btn-coral { background:var(--c-mauve); color:#fff; }
.btn-coral:hover { background:#8d0e42; }
.estado-opts  { display:flex; flex-direction:column; gap:8px; }
.estado-opt   { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:1.5px solid var(--c-border); cursor:pointer; transition:all .12s; background:var(--c-surface); }
.estado-opt:hover, .estado-opt.selected { border-color:var(--c-primary); background:var(--c-primary-lt); }
.opt-icon { font-size:1.3rem; width:28px; text-align:center; flex-shrink:0; }
</style>
