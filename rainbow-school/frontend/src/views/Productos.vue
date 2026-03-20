<template>
  <div>
    <div class="page-header">
      <div class="page-header-info">
        <h1>Productos</h1>
        <p>Catálogo de la cafetería escolar</p>
      </div>
      <button class="btn btn-primary" @click="abrirNuevo">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Producto
      </button>
    </div>

   
    <div class="cats-row mb-4">
      <button v-for="c in ['Todas', ...categorias]" :key="c"
        :class="['cat-pill', filtroCategoria === (c==='Todas' ? '' : c) && 'active']"
        @click="filtroCategoria = c==='Todas' ? '' : c">{{ c }}</button>
    </div>

  
    <div class="prod-grid" v-if="!loading">
      <div class="prod-card" v-for="p in productosFiltrados" :key="p.id">
        <div class="prod-hero" :style="{ background: heroColor(p.categoria?.nombre) }">
          <span class="prod-emoji">{{ emoji(p.nombre) }}</span>
        </div>
        <div class="prod-body">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="prod-name">{{ p.nombre }}</div>
              <code class="code-chip">{{ p.codigo }}</code>
            </div>
            <span :class="['badge', estadoBadge(p.estado)]">{{ p.estado }}</span>
          </div>
          <span v-if="p.categoria" class="badge badge-sky" style="margin-bottom:6px;">{{ p.categoria.nombre }}</span>
          <p class="prod-desc">{{ p.descripcion || 'Sin descripción' }}</p>
          <div class="prod-foot">
            <span class="prod-price">L {{ fNum(p.precio) }}</span>
            <div class="flex gap-2">
              <button class="btn btn-ghost btn-sm" @click="editar(p)">✏️</button>
              <button class="btn btn-ghost btn-sm" @click="confirmarEliminar(p)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <div class="prod-empty" v-if="!productosFiltrados.length">
        <div class="empty-state"><span>Sin productos en esta categoría</span></div>
      </div>
    </div>
    <div class="prod-grid" v-else>
      <div v-for="i in 8" :key="i" class="skeleton" style="height:210px;border-radius:20px;"></div>
    </div>

  
    <div class="modal-backdrop" v-if="showModal" @click.self="cerrar">
      <div class="modal" style="max-width:520px;">
        <div class="modal-header">
          <div><h2>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h2></div>
          <button class="btn btn-ghost btn-sm" @click="cerrar">✕</button>
        </div>

        <div class="flex flex-col gap-4">
          
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" @input="onNombreChange" class="input" placeholder="Ej: Almuerzo Completo"/>
          </div>

          
          <div class="grid-2">
            <div class="form-group">
              <label>Categoría</label>
              <select v-model.number="form.categoria_id" @change="onCategoriaChange" class="select">
                <option :value="null">Sin categoría</option>
                <option v-for="c in catOpciones" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Código <span class="auto-badge">auto</span></label>
              <div class="codigo-wrap">
                <span class="codigo-prefix">{{ codigoPrefix }}</span>
                <input v-model="form.codigo" class="input codigo-input" readonly/>
              </div>
            </div>
          </div>

          
          <div class="grid-2">
            <div class="form-group">
              <label>Precio (L) *</label>
              <input v-model.number="form.precio" type="number" step="0.01" min="0" class="input" placeholder="45.00"/>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.estado" class="select">
                <option value="disponible">✅ Disponible</option>
                <option value="agotado">⚠️ Agotado</option>
                <option value="descontinuado">❌ Descontinuado</option>
              </select>
            </div>
          </div>

        
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" class="input" rows="2" placeholder="Descripción breve del producto..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrar">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando…' : editando ? 'Actualizar' : 'Crear Producto' }}
          </button>
        </div>
      </div>
    </div>

 
    <div class="modal-backdrop" v-if="showConfirm" @click.self="showConfirm=false">
      <div class="modal" style="max-width:400px;">
        <div class="modal-header"><h2>¿Eliminar producto?</h2><button class="btn btn-ghost btn-sm" @click="showConfirm=false">✕</button></div>
        <p>Se eliminará <strong>{{ elimTarget?.nombre }}</strong>. Puede afectar consumos existentes.</p>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showConfirm=false">Cancelar</button>
          <button class="btn btn-coral" @click="eliminar">Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { productosService } from '@/services/api.js'

const showToast = inject('showToast')
const loading   = ref(true)
const productos  = ref([])
const catOpciones = ref([])
const filtroCategoria = ref('')
const showModal  = ref(false)
const showConfirm = ref(false)
const editando   = ref(false)
const guardando  = ref(false)
const elimTarget = ref(null)


const PREFIJOS = {
  'Almuerzo': 'ALM', 'Comida': 'COM', 'Bebida': 'BEB', 'Jugo': 'JUG',
  'Snack': 'SNK', 'Postre': 'POS', 'Desayuno': 'DSY', 'Cena': 'CEN',
  'Especial': 'ESP', 'Otro': 'OTR'
}
const DEFAULT_PREFIX = 'PRD'

const codigoPrefix = computed(() => {
  if (!form.value.categoria_id) return DEFAULT_PREFIX
  const cat = catOpciones.value.find(c => c.id === form.value.categoria_id)
  if (!cat) return DEFAULT_PREFIX
 
  const key = Object.keys(PREFIJOS).find(k => cat.nombre?.toLowerCase().includes(k.toLowerCase()))
  return key ? PREFIJOS[key] : cat.nombre?.substring(0, 3).toUpperCase() ?? DEFAULT_PREFIX
})

function generarCodigo() {
  const prefix = codigoPrefix.value

  const existentes = productos.value.filter(p => p.codigo?.startsWith(prefix)).length
  const num = String(existentes + 1).padStart(2, '0')
  form.value.codigo = `${prefix}${num}`
}

function onCategoriaChange() {
  if (!editando.value) generarCodigo()
}

function onNombreChange() {

  if (!editando.value) generarCodigo()
}

const formVacio = () => ({
  nombre: '', codigo: '', precio: 0, categoria_id: null,
  descripcion: '', estado: 'disponible', _id: null
})
const form = ref(formVacio())

const categorias = computed(() => [...new Set(productos.value.map(p => p.categoria?.nombre).filter(Boolean))])
const productosFiltrados = computed(() => {
  if (!filtroCategoria.value) return productos.value
  return productos.value.filter(p => p.categoria?.nombre === filtroCategoria.value)
})

const fNum = n => Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })
const HERO_COLORS = { Comida:'#FDF0F4', Bebida:'#F3E5F5', Snack:'#E8F5E9', Postre:'#FFF3E0', Almuerzo:'#FCE8F0' }
const heroColor = c => HERO_COLORS[c] ?? '#FDF8FA'
const estadoBadge = e => e === 'disponible' ? 'badge-teal' : e === 'agotado' ? 'badge-amber' : 'badge-gray'
const EMOJIS = ['Almuerzo','Jugo','Agua','Snack','Yogurt','Pizza','Pollo','Arroz','Ensalada','Postre','Pan','Sandía','Mango','Tacos','Burrito']
const EMap   = { Almuerzo:'🍱',Jugo:'🥤',Agua:'💧',Snack:'🍿',Yogurt:'🥛',Pizza:'🍕',Pollo:'🍗',Arroz:'🍚',Ensalada:'🥗',Postre:'🍰',Pan:'🥐',Sandía:'🍉',Mango:'🥭',Tacos:'🌮',Burrito:'🌯' }
const emoji  = n => { const k = EMOJIS.find(k => (n ?? '').toLowerCase().includes(k.toLowerCase())); return k ? EMap[k] : '🍽️' }

function abrirNuevo() {
  editando.value = false
  form.value = formVacio()
  showModal.value = true

  setTimeout(generarCodigo, 50)
}

function editar(p) {
  editando.value = true
  form.value = { nombre: p.nombre, codigo: p.codigo, precio: p.precio, categoria_id: p.categoria_id, descripcion: p.descripcion ?? '', estado: p.estado, _id: p.id }
  showModal.value = true
}

function cerrar() { showModal.value = false }
function confirmarEliminar(p) { elimTarget.value = p; showConfirm.value = true }

async function cargar() {
  loading.value = true
  try { productos.value = (await productosService.getAll()).data?.data ?? [] } catch {}
  loading.value = false
}

async function cargarCategorias() {
  try { catOpciones.value = (await productosService.getCategorias()).data?.data ?? [] } catch {}
}

async function guardar() {
  if (!form.value.nombre || !form.value.precio) { showToast('Nombre y precio son requeridos', 'error'); return }
  if (!form.value.codigo) generarCodigo()
  guardando.value = true
  try {
    const payload = {
      nombre: form.value.nombre, codigo: form.value.codigo,
      precio: form.value.precio, categoria_id: form.value.categoria_id,
      descripcion: form.value.descripcion, estado: form.value.estado
    }
    if (editando.value) { await productosService.actualizar(form.value._id, payload); showToast('Producto actualizado', 'success') }
    else { await productosService.crear(payload); showToast('Producto creado', 'success') }
    cerrar(); cargar()
  } catch (err) { showToast(err.response?.data?.message ?? 'Error al guardar', 'error') }
  guardando.value = false
}

async function eliminar() {
  try { await productosService.eliminar(elimTarget.value.id); showToast('Producto eliminado', 'success'); showConfirm.value = false; cargar() }
  catch { showToast('No se pudo eliminar', 'error') }
}

onMounted(() => { cargar(); cargarCategorias() })
</script>

<style scoped>
.cats-row  { display:flex; gap:var(--sp-2); flex-wrap:wrap; }
.cat-pill  { font-family:var(--font-display); font-size:0.75rem; font-weight:700; padding:6px 14px; border-radius:100px; border:1.5px solid var(--c-border); background:var(--c-surface); color:var(--c-ink-soft); cursor:pointer; transition:all .12s; text-transform:uppercase; letter-spacing:0.04em; }
.cat-pill.active { background:var(--c-primary); color:#fff; border-color:var(--c-primary-dk); }
.prod-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:var(--sp-4); }
.prod-card { background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--r-lg); overflow:hidden; transition:all .18s; }
.prod-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-hover); }
.prod-hero  { height:80px; display:flex; align-items:center; justify-content:center; }
.prod-emoji { font-size:2.2rem; }
.prod-body  { padding:var(--sp-4); }
.prod-name  { font-family:var(--font-display); font-weight:700; font-size:0.85rem; color:var(--c-ink); margin-bottom:3px; }
.prod-desc  { font-size:0.74rem; color:var(--c-ink-soft); margin-top:var(--sp-2); line-height:1.4; }
.prod-foot  { display:flex; justify-content:space-between; align-items:center; padding-top:var(--sp-3); border-top:1px solid var(--c-border); margin-top:var(--sp-3); }
.prod-price { font-family:var(--font-display); font-weight:800; font-size:0.92rem; color:var(--c-primary-dk); }
.prod-empty { grid-column:1/-1; }
.code-chip  { background:var(--c-primary-lt); border:1px solid var(--c-border); border-radius:4px; padding:1px 6px; color:var(--c-primary); display:inline-block; margin-top:2px; font-size:0.65rem; font-weight:700; }
.auto-badge { background:var(--c-primary-lt); color:var(--c-primary); font-size:0.65rem; font-weight:700; padding:1px 6px; border-radius:100px; margin-left:4px; text-transform:uppercase; font-family:var(--font-display); }
.codigo-wrap  { display:flex; align-items:center; gap:6px; }
.codigo-prefix { font-family:var(--font-display); font-weight:800; font-size:0.8rem; color:var(--c-primary); background:var(--c-primary-lt); padding:6px 10px; border-radius:var(--r-sm); white-space:nowrap; border:1.5px solid var(--c-border); }
.codigo-input { background:var(--c-bg) !important; color:var(--c-ink-soft); cursor:default; flex:1; }
.btn-coral { background:var(--c-rose); color:#fff; }
.btn-coral:hover { background:#e05580; }
.mb-4 { margin-bottom:16px; }
</style>
