<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Consumos</h1>
        <p>Registro y seguimiento de consumos por estudiante</p>
      </div>
      <button class="btn btn-amber btn-lg" @click="showModal=true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrar Consumo
      </button>
    </div>

  
    <div class="card mb-4">
      <div class="flex gap-4 items-center">
        <input v-model="busqueda" class="input" placeholder="Buscar por estudiante o producto..." style="flex:1;max-width:340px;"/>
        <input v-model="filtroFecha" type="date" class="input" style="width:160px;"/>
        <div class="flex gap-3 text-sm text-muted" style="margin-left:auto;">{{ consumosFiltrados.length }} registros</div>
      </div>
    </div>

 
    <div class="card">
      <div class="table-wrap" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estudiante</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unit.</th>
              <th>Subtotal</th>
              <th>Facturado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in consumosFiltrados" :key="c.id">
              <td class="font-bold" style="font-size:0.8rem;">{{ fFecha(c.fecha_consumo) }}</td>
              <td class="text-sm text-muted">{{ c.hora_consumo?.slice(0,5) ?? '—' }}</td>
              <td>{{ c.estudiante?.nombre_completo ?? `Est. #${c.estudiante_id}` }}</td>
              <td><strong>{{ c.producto?.nombre ?? `Prod. #${c.producto_id}` }}</strong></td>
              <td class="text-center">{{ c.cantidad }}</td>
              <td>L {{ fNum(c.precio_unitario) }}</td>
              <td><strong>L {{ fNum(c.subtotal) }}</strong></td>
              <td>
                <span :class="['badge', c.facturado ? 'badge-teal' : 'badge-gray']">
                  {{ c.facturado ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <button v-if="!c.facturado" class="btn btn-ghost btn-sm" @click="confirmarEliminar(c)">🗑️</button>
              </td>
            </tr>
            <tr v-if="!consumosFiltrados.length">
              <td colspan="9"><div class="empty-state"><span>No hay consumos registrados</span></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:52px;"></div>
      </div>
    </div>

    
    <div class="modal-backdrop" v-if="showModal" @click.self="cerrar">
      <div class="modal" style="max-width:560px;">
        <div class="modal-header">
          <div><h2>Registrar Consumo</h2><p>Selecciona el estudiante y los productos</p></div>
          <button class="btn btn-ghost btn-sm" @click="cerrar">✕</button>
        </div>

       
        <div class="step-block">
          <div class="step-label"><span class="step-num">1</span> Seleccionar estudiante</div>
          <div class="form-group mt-4">
            <label>Buscar estudiante</label>
            <input v-model="estBusq" @input="filtrarEst" class="input" placeholder="Nombre o identificación..."/>
          </div>
          <div v-if="estOpciones.length && !estSelec" class="est-dropdown">
            <div v-for="e in estOpciones.slice(0,5)" :key="e.id" class="est-opt" @click="selecEst(e)">
              <div class="dot-av">{{ initials(e.nombre_completo) }}</div>
              <div>
                <div class="font-bold" style="font-size:0.83rem;">{{ e.nombre_completo }}</div>
                <div class="text-sm text-muted">{{ e.identificacion }} · {{ e.grado }}</div>
              </div>
              <span :class="['badge ml-auto', creditoBadge(e.credito_disponible)]">L {{ fNum(e.credito_disponible) }}</span>
            </div>
          </div>
          <div v-if="estSelec" class="est-selected mt-3">
            <div class="dot-av big">{{ initials(estSelec.nombre_completo) }}</div>
            <div>
              <div class="font-bold">{{ estSelec.nombre_completo }}</div>
              <div class="text-sm text-muted">{{ estSelec.grado }} · Crédito: <strong>L {{ fNum(estSelec.credito_disponible) }}</strong></div>
            </div>
            <button class="btn btn-ghost btn-sm ml-auto" @click="estSelec=null;estBusq=''">✕</button>
          </div>
        </div>

      
        <div class="step-block mt-4" v-if="estSelec">
          <div class="step-label"><span class="step-num">2</span> Añadir productos</div>
          <div class="flex gap-3 mt-4">
            <select v-model="prodId" class="select" style="flex:1;">
              <option value="">Selecciona producto...</option>
              <option v-for="p in productos" :key="p.id" :value="p.id">{{ p.nombre }} — L {{ fNum(p.precio) }}</option>
            </select>
            <input v-model.number="cant" type="number" min="1" max="20" class="input" style="width:72px;"/>
            <button class="btn btn-amber" @click="agregarItem">+ Añadir</button>
          </div>
          <div v-if="items.length" class="items-wrap mt-4">
            <div v-for="(it,i) in items" :key="i" class="item-row">
              <span style="font-size:0.9rem;">🍽️</span>
              <span class="font-bold" style="flex:1;font-size:0.82rem;">{{ it.nombre }}</span>
              <span class="text-muted text-sm">x{{ it.cantidad }}</span>
              <span class="font-bold" style="width:80px;text-align:right;font-size:0.82rem;">L {{ fNum(it.subtotal) }}</span>
              <button class="btn btn-ghost btn-sm" @click="items.splice(i,1)">✕</button>
            </div>
            <div class="total-strip">
              <span>Total del consumo</span>
              <span class="total-val">L {{ fNum(totalItems) }}</span>
            </div>
          </div>
          <div v-if="items.length" class="text-sm text-muted mt-3" style="background:var(--c-amber-lt);padding:8px 12px;border-radius:8px;">
            ⚠️ Se registrará un consumo separado por cada producto añadido (requerido por el backend).
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrar">Cancelar</button>
          <button class="btn btn-amber" @click="registrar" :disabled="!estSelec || !items.length || guardando">
            {{ guardando ? 'Registrando…' : `Confirmar (${items.length} producto${items.length>1?'s':''})` }}
          </button>
        </div>
      </div>
    </div>

   
    <div class="modal-backdrop" v-if="showConfirm" @click.self="showConfirm=false">
      <div class="modal" style="max-width:400px;">
        <div class="modal-header"><h2>¿Anular consumo?</h2><button class="btn btn-ghost btn-sm" @click="showConfirm=false">✕</button></div>
        <p>Se eliminará el registro. El crédito será devuelto al estudiante si aplica.</p>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showConfirm=false">Cancelar</button>
          <button class="btn btn-coral" @click="eliminar">Sí, anular</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { consumosService, estudiantesService, productosService } from '@/services/api.js'

const showToast = inject('showToast')
const loading = ref(true)
const consumos = ref([])
const estudiantes = ref([])
const productos = ref([])
const busqueda = ref('')
const filtroFecha = ref('')
const showModal = ref(false)
const showConfirm = ref(false)
const guardando = ref(false)
const elimTarget = ref(null)
const estBusq = ref('')
const estOpciones = ref([])
const estSelec = ref(null)
const prodId = ref('')
const cant = ref(1)
const items = ref([])

const totalItems = computed(() => items.value.reduce((s, i) => s + i.subtotal, 0))
const consumosFiltrados = computed(() => {
  let lista = consumos.value
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(c =>
      (c.estudiante?.nombre_completo ?? '').toLowerCase().includes(q) ||
      (c.producto?.nombre ?? '').toLowerCase().includes(q)
    )
  }
  if (filtroFecha.value) lista = lista.filter(c => c.fecha_consumo === filtroFecha.value)
  return lista
})

function fNum(n) { return Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 }) }
function fFecha(d) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: '2-digit' }) }
function initials(n) { return (n ?? '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }
function creditoBadge(v) { return !v || Number(v) <= 0 ? 'badge-coral' : Number(v) < 100 ? 'badge-amber' : 'badge-teal' }

function filtrarEst() {
  if (!estBusq.value || estBusq.value.length < 2) { estOpciones.value = []; return }
  const q = estBusq.value.toLowerCase()
  estOpciones.value = estudiantes.value.filter(e =>
    (e.nombre_completo ?? '').toLowerCase().includes(q) || (e.identificacion ?? '').toLowerCase().includes(q)
  )
}
function selecEst(e) { estSelec.value = e; estOpciones.value = []; estBusq.value = e.nombre_completo }

function agregarItem() {
  if (!prodId.value) return
  const prod = productos.value.find(p => p.id === prodId.value || p.id === Number(prodId.value))
  if (!prod) return
  const ex = items.value.find(i => i.producto_id === prod.id)
  if (ex) { ex.cantidad += cant.value; ex.subtotal = ex.cantidad * Number(prod.precio) }
  else items.value.push({ producto_id: prod.id, nombre: prod.nombre, precio: Number(prod.precio), cantidad: cant.value, subtotal: cant.value * Number(prod.precio) })
  prodId.value = ''; cant.value = 1
}

function cerrar() { showModal.value = false; estSelec.value = null; estBusq.value = ''; items.value = []; prodId.value = ''; cant.value = 1 }
function confirmarEliminar(c) { elimTarget.value = c; showConfirm.value = true }

async function cargar() {
  loading.value = true
  try { const res = await consumosService.getAll(); consumos.value = res.data?.data ?? [] }
  catch { console.error('Error cargando consumos') }
  loading.value = false
}

async function registrar() {
  if (!estSelec.value || !items.value.length) return
  guardando.value = true
  let ok = 0
  for (const item of items.value) {
    try {
      await consumosService.registrar({
        estudiante_id: estSelec.value.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad
      })
      ok++
    } catch (err) {
      showToast(`Error en ${item.nombre}: ${err.response?.data?.message ?? 'Error'}`, 'error')
    }
  }
  if (ok > 0) {
    showToast(`${ok} consumo(s) registrado(s) exitosamente`, 'success')
    cerrar(); cargar()
  }
  guardando.value = false
}

async function eliminar() {
  try {
    await consumosService.eliminar(elimTarget.value.id)
    showToast('Consumo eliminado', 'success')
    showConfirm.value = false; cargar()
  } catch { showToast('No se pudo eliminar el consumo', 'error') }
}

onMounted(async () => {
  await cargar()
  try { const r = await estudiantesService.getAll(); estudiantes.value = r.data?.data ?? [] } catch {}
  try { const r = await productosService.getAll(); productos.value = r.data?.data ?? [] } catch {}
})
</script>

<style scoped>
.step-block { background: var(--c-bg); border-radius: var(--r-md); padding: var(--sp-4); }
.step-label { display: flex; align-items: center; gap: var(--sp-2); font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; }
.step-num { width: 22px; height: 22px; background: var(--c-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }
.est-dropdown { border: 1.5px solid var(--c-border); border-radius: var(--r-md); overflow: hidden; background: var(--c-surface); margin-top: var(--sp-2); }
.est-opt { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); cursor: pointer; transition: background .1s; }
.est-opt:hover { background: var(--c-bg); }
.est-selected { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1.5px solid var(--c-amber); border-radius: var(--r-md); background: var(--c-amber-lt); }
.dot-av { width: 30px; height: 30px; border-radius: 50%; background: var(--c-amber); color: #fff; font-family: var(--font-display); font-weight: 800; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dot-av.big { width: 36px; height: 36px; font-size: 0.82rem; }
.ml-auto { margin-left: auto; }
.items-wrap { border: 1.5px solid var(--c-border); border-radius: var(--r-md); overflow: hidden; }
.item-row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--c-border); }
.total-strip { display: flex; justify-content: space-between; align-items: center; padding: var(--sp-3) var(--sp-4); background: var(--c-bg); font-family: var(--font-display); font-weight: 600; font-size: 0.85rem; }
.total-val { font-size: 1rem; font-weight: 800; color: var(--c-primary-dk); }
.btn-coral { background: var(--c-coral); color: #fff; }
</style>
