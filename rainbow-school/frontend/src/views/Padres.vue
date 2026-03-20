<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Padres / Tutores</h1>
        <p>Gestión de padres, tutores y sus estudiantes vinculados</p>
      </div>
      <button class="btn btn-primary" @click="abrirNuevoPadre">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Padre
      </button>
    </div>

    <div class="card mb-4">
      <input v-model="busqueda" class="input" placeholder="Buscar por nombre, identificación o email..." style="max-width:380px;"/>
    </div>

    <div class="card">
      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Padre/Tutor</th>
              <th>Identificación</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Hijos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in padresFiltrados" :key="p.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar-md" :style="{ background: avatarColor(p.nombre_completo) }">{{ initials(p.nombre_completo) }}</div>
                  <div class="font-bold">{{ p.nombre_completo }}</div>
                </div>
              </td>
              <td><code class="code-chip">{{ p.identificacion }}</code></td>
              <td>{{ p.telefono ?? '—' }}</td>
              <td class="text-sm text-muted">{{ p.email ?? '—' }}</td>
              <td>
                <button
                  :class="['badge', p.estudiantes?.length ? 'badge-teal' : 'badge-gray', 'badge-btn']"
                  @click="verHijos(p)"
                  :title="p.estudiantes?.length ? 'Ver hijos' : 'Sin hijos'"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {{ p.estudiantes?.length ?? 0 }} hijo(s)
                </button>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm" @click="editar(p)" title="Editar padre">✏️</button>
                  <button class="btn btn-primary btn-sm" @click="abrirVincular(p)" title="Vincular estudiante">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    Vincular hijo
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="confirmarEliminar(p)" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="!padresFiltrados.length">
              <td colspan="6"><div class="empty-state"><span>No se encontraron padres/tutores</span></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:52px;"></div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showModalPadre" @click.self="cerrarPadre">
      <div class="modal">
        <div class="modal-header">
          <div><h2>{{ editando ? 'Editar Padre/Tutor' : 'Nuevo Padre/Tutor' }}</h2></div>
          <button class="btn btn-ghost btn-sm" @click="cerrarPadre">✕</button>
        </div>
        <div class="grid-2 gap-4">
          <div class="form-group" style="grid-column:1/-1;">
            <label>Nombre completo *</label>
            <input v-model="formPadre.nombre_completo" class="input" placeholder="Nombre del padre/tutor"/>
          </div>
          <div class="form-group">
            <label>Identificación *</label>
            <input v-model="formPadre.identificacion" class="input" placeholder="DNI"/>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="formPadre.telefono" class="input" placeholder="9999-9999"/>
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label>Correo electrónico</label>
            <input v-model="formPadre.email" type="email" class="input" placeholder="correo@email.com"/>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrarPadre">Cancelar</button>
          <button class="btn btn-primary" @click="guardarPadre" :disabled="guardando">
            {{ guardando ? 'Guardando…' : editando ? 'Actualizar' : 'Crear Padre' }}
          </button>
        </div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showVincular" @click.self="cerrarVincular">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <div>
            <h2>Vincular Estudiante</h2>
            <p>Selecciona un estudiante existente para vincularlo a <strong>{{ padreActivo?.nombre_completo }}</strong></p>
          </div>
          <button class="btn btn-ghost btn-sm" @click="cerrarVincular">✕</button>
        </div>

       
        <div class="search-wrap w-full mb-3">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="busqEst"
            @input="filtrarEstudiantes"
            class="input search-input"
            placeholder="Buscar por nombre o identificación..."
            autofocus
          />
        </div>

       
        <div v-if="estSelec" class="est-selec mb-4">
          <div class="est-av" :style="{ background: avatarColor(estSelec.nombre_completo) }">
            {{ initials(estSelec.nombre_completo) }}
          </div>
          <div class="est-info">
            <div class="font-bold" style="font-size:0.85rem;">{{ estSelec.nombre_completo }}</div>
            <div class="text-sm text-muted">{{ estSelec.identificacion }} · {{ estSelec.grado ?? '—' }}</div>
          </div>
          <span class="badge badge-teal" style="margin-left:auto;">Seleccionado ✓</span>
          <button class="btn btn-ghost btn-sm" @click="estSelec = null; busqEst = ''" title="Cambiar">✕</button>
        </div>

        <div v-else>
          <div class="est-lista" v-if="estsFiltrados.length || !busqEst">
            <div
              v-for="e in (busqEst.length > 1 ? estsFiltrados : todosEstudiantes)"
              :key="e.id"
              class="est-opt"
              @click="selecEst(e)"
            >
              <div class="est-av" :style="{ background: avatarColor(e.nombre_completo) }">
                {{ initials(e.nombre_completo) }}
              </div>
              <div class="est-info">
                <div class="font-bold" style="font-size:0.82rem;">{{ e.nombre_completo }}</div>
                <div class="text-sm text-muted">{{ e.identificacion }} · {{ e.grado ?? '—' }}</div>
              </div>
          
              <span v-if="e.padre_id" class="badge badge-gray" style="font-size:0.65rem;">
                Ya vinculado
              </span>
              <span v-else class="badge badge-sky" style="font-size:0.65rem;">Sin tutor</span>
            </div>
            <div v-if="!todosEstudiantes.length" class="no-results">
              <span>No hay estudiantes registrados en el sistema</span>
            </div>
          </div>

          <div v-else-if="busqEst.length > 1 && !estsFiltrados.length" class="no-results">
            <span>No se encontró ningún estudiante con "{{ busqEst }}"</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrarVincular">Cancelar</button>
          <button class="btn btn-primary" @click="vincular" :disabled="!estSelec || guardando">
            {{ guardando ? 'Vinculando…' : 'Confirmar vinculación' }}
          </button>
        </div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showHijos" @click.self="showHijos=false">
      <div class="modal" style="max-width:460px;">
        <div class="modal-header">
          <div>
            <h2>Hijos de {{ padreSelec?.nombre_completo }}</h2>
            <p>{{ hijosList.length }} estudiante(s) vinculado(s)</p>
          </div>
          <button class="btn btn-ghost btn-sm" @click="showHijos=false">✕</button>
        </div>

        <div v-if="!hijosList.length" class="empty-state" style="padding:28px 0;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>No hay estudiantes vinculados</span>
          <button class="btn btn-primary btn-sm" @click="showHijos=false; abrirVincular(padreSelec)">
            Vincular estudiante →
          </button>
        </div>

        <div v-else class="hijos-list">
          <div v-for="h in hijosList" :key="h.id" class="hijo-row">
            <div class="hijo-av" :style="{ background: avatarColor(h.nombre_completo) }">
              {{ initials(h.nombre_completo) }}
            </div>
            <div class="hijo-info">
              <div class="hijo-nombre">{{ h.nombre_completo }}</div>
              <div class="hijo-meta">{{ h.grado ?? '—' }}{{ h.seccion ? ' / ' + h.seccion : '' }}</div>
            </div>
            <span :class="['badge', estadoBadge(h.estado)]">{{ h.estado }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showHijos=false">Cerrar</button>
          <button class="btn btn-primary" @click="showHijos=false; abrirVincular(padreSelec)">
            + Vincular otro
          </button>
        </div>
      </div>
    </div>


    <div class="modal-backdrop" v-if="showConfirm" @click.self="showConfirm=false">
      <div class="modal" style="max-width:400px;">
        <div class="modal-header">
          <h2>¿Eliminar padre/tutor?</h2>
          <button class="btn btn-ghost btn-sm" @click="showConfirm=false">✕</button>
        </div>
        <p>Se eliminará a <strong>{{ elimTarget?.nombre_completo }}</strong>.</p>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showConfirm=false">Cancelar</button>
          <button class="btn btn-coral" @click="eliminar">Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { padresService, estudiantesService } from '@/services/api.js'

const showToast = inject('showToast')

const loading        = ref(true)
const padres         = ref([])
const todosEstudiantes = ref([])
const busqueda       = ref('')
const guardando      = ref(false)
const editando       = ref(false)

const showModalPadre = ref(false)
const showVincular   = ref(false)
const showHijos      = ref(false)
const showConfirm    = ref(false)

const padreActivo    = ref(null)
const padreSelec     = ref(null)
const hijosList      = ref([])
const elimTarget     = ref(null)

const busqEst        = ref('')
const estsFiltrados  = ref([])
const estSelec       = ref(null)

const formPadreVacio = () => ({ nombre_completo:'', identificacion:'', telefono:'', email:'', _id:null })
const formPadre      = ref(formPadreVacio())

const padresFiltrados = computed(() => {
  if (!busqueda.value) return padres.value
  const q = busqueda.value.toLowerCase()
  return padres.value.filter(p =>
    (p.nombre_completo ?? '').toLowerCase().includes(q) ||
    (p.identificacion  ?? '').toLowerCase().includes(q) ||
    (p.email           ?? '').toLowerCase().includes(q)
  )
})

const initials    = n => (n ?? '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
const COLORS      = ['#C2185B','#880E4F','#AD1457','#7B1FA2','#00796B']
const avatarColor = n => COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length]
const estadoBadge = e => e === 'activo' ? 'badge-teal' : e === 'suspendido' ? 'badge-amber' : e === 'cancelado' ? 'badge-coral' : 'badge-gray'

async function cargar() {
  loading.value = true
  try { padres.value = (await padresService.getAll()).data?.data ?? [] } catch {}
  loading.value = false
}

async function cargarEstudiantes() {
  try { todosEstudiantes.value = (await estudiantesService.getAll()).data?.data ?? [] } catch {}
}


function abrirNuevoPadre() { editando.value = false; formPadre.value = formPadreVacio(); showModalPadre.value = true }
function editar(p)          { editando.value = true; formPadre.value = { ...p, _id: p.id }; showModalPadre.value = true }
function cerrarPadre()      { showModalPadre.value = false }
function confirmarEliminar(p) { elimTarget.value = p; showConfirm.value = true }

async function guardarPadre() {
  if (!formPadre.value.nombre_completo || !formPadre.value.identificacion) {
    showToast('Nombre e identificación requeridos', 'error'); return
  }
  guardando.value = true
  try {
    const payload = { nombre_completo: formPadre.value.nombre_completo, identificacion: formPadre.value.identificacion, telefono: formPadre.value.telefono, email: formPadre.value.email }
    if (editando.value) { await padresService.actualizar(formPadre.value._id, payload); showToast('Padre actualizado', 'success') }
    else                { await padresService.crear(payload); showToast('Padre creado', 'success') }
    cerrarPadre(); cargar()
  } catch (err) { showToast(err.response?.data?.message ?? 'Error', 'error') }
  guardando.value = false
}

async function eliminar() {
  try { await padresService.eliminar(elimTarget.value.id); showToast('Eliminado', 'success'); showConfirm.value = false; cargar() }
  catch { showToast('No se pudo eliminar', 'error') }
}


function abrirVincular(padre) {
  padreActivo.value = padre
  busqEst.value     = ''
  estSelec.value    = null
  estsFiltrados.value = []
  showVincular.value  = true
}

function cerrarVincular() { showVincular.value = false }

function filtrarEstudiantes() {
  if (!busqEst.value || busqEst.value.length < 2) { estsFiltrados.value = []; return }
  const q = busqEst.value.toLowerCase()
  estsFiltrados.value = todosEstudiantes.value.filter(e =>
    (e.nombre_completo ?? '').toLowerCase().includes(q) ||
    (e.identificacion  ?? '').toLowerCase().includes(q)
  )
}

function selecEst(e) { estSelec.value = e; busqEst.value = '' }

async function vincular() {
  if (!estSelec.value) return
  guardando.value = true
  try {
    const res = await padresService.vincularEstudiante(padreActivo.value.id, estSelec.value.id)
    showToast(res.data?.message ?? 'Vinculado correctamente', 'success')
    cerrarVincular()
    await cargar()
    await cargarEstudiantes()
  } catch (err) {
    showToast(err.response?.data?.message ?? 'Error al vincular', 'error')
  }
  guardando.value = false
}


function verHijos(p) {
  padreSelec.value = p
  hijosList.value  = p.estudiantes ?? []
  showHijos.value  = true
}

onMounted(() => { cargar(); cargarEstudiantes() })
</script>

<style scoped>
.avatar-md   { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:0.72rem; color:#fff; flex-shrink:0; }
.code-chip   { background:var(--c-bg); border:1px solid var(--c-border); border-radius:4px; padding:2px 8px; font-size:0.74rem; color:var(--c-ink-soft); }
.badge-btn   { cursor:pointer; border:none; transition:all .15s; }
.badge-btn:hover { opacity:.8; transform:scale(1.04); }
.btn-coral   { background:var(--c-mauve); color:#fff; }
.btn-coral:hover { background:#8d0e42; }
.mb-3 { margin-bottom:12px; }
.mb-4 { margin-bottom:16px; }


.w-full { width:100%; max-width:100% !important; }
.search-wrap { position:relative; }
.search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--c-ink-faint); pointer-events:none; }
.search-input { padding-left:32px; }


.est-lista  { max-height:240px; overflow-y:auto; border:1.5px solid var(--c-border); border-radius:var(--r-md); background:var(--c-surface); }
.est-opt    { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--c-border); transition:background .1s; }
.est-opt:last-child { border-bottom:none; }
.est-opt:hover      { background:var(--c-primary-lt); }
.est-av    { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:0.65rem; color:#fff; flex-shrink:0; }
.est-info  { flex:1; min-width:0; }


.est-selec {
  display:flex; align-items:center; gap:10px;
  padding:12px 14px; border-radius:var(--r-md);
  border:2px solid var(--c-primary); background:var(--c-primary-lt);
}

.no-results { padding:20px; text-align:center; color:var(--c-ink-soft); font-size:0.82rem; display:flex; flex-direction:column; align-items:center; gap:8px; border:1.5px solid var(--c-border); border-radius:var(--r-md); }


.hijos-list { display:flex; flex-direction:column; gap:8px; }
.hijo-row   { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:var(--r-md); border:1px solid var(--c-border); background:var(--c-bg); }
.hijo-av    { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:0.65rem; color:#fff; flex-shrink:0; }
.hijo-info  { flex:1; }
.hijo-nombre { font-weight:700; font-size:0.82rem; color:var(--c-ink); }
.hijo-meta   { font-size:0.72rem; color:var(--c-ink-soft); margin-top:1px; }
</style>
