<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="rgba(255,255,255,0.18)"/>
            <path d="M7 14C7 10.134 10.134 7 14 7C17.866 7 21 10.134 21 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M9 14C9 11.239 11.239 9 14 9C16.761 9 19 11.239 19 14" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <circle cx="14" cy="17" r="2" fill="white"/>
          </svg>
        </div>
        <div>
          <span class="logo-name">Rainbow</span>
          <span class="logo-sub">School · Credits</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-section-label">General</span>
        <router-link to="/dashboard" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </router-link>
        <router-link to="/consumos" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Consumos
        </router-link>
        <router-link to="/facturas" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Facturas
        </router-link>

        <span class="nav-section-label">Gestión</span>
        <router-link to="/estudiantes" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Estudiantes
        </router-link>
        <router-link to="/padres" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Padres / Tutores
        </router-link>
        <router-link to="/productos" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Productos
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">A</div>
          <div>
            <span class="user-name">Administrador</span>
            <span class="user-role">Rainbow School</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="page-main">
      <router-view />
    </main>

 
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <span>{{ t.icon }}</span> {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const toasts = ref([])
function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: '·' }
  const id = Date.now()
  toasts.value.push({ id, message, type, icon: icons[type] })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}
provide('showToast', showToast)
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: linear-gradient(175deg, #3D0C22 0%, #6A1035 50%, #880E4F 100%);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: var(--sp-6) 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 0 var(--sp-5) var(--sp-6);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: var(--sp-4);
}
.logo-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
  line-height: 1.1;
  display: block;
}
.logo-sub { font-size: 0.68rem; color: rgba(255,255,255,0.35); display: block; letter-spacing: 0.04em; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; padding: 0 var(--sp-3); gap: 2px; }
.nav-section-label {
  font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(255,255,255,0.25);
  font-family: var(--font-display);
  padding: var(--sp-4) var(--sp-3) var(--sp-2);
}
.nav-link {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3); border-radius: var(--r-sm);
  color: rgba(255,255,255,0.5); font-size: 0.835rem; font-weight: 500;
  text-decoration: none; transition: all 0.15s ease;
  font-family: var(--font-display);
}
.nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
.nav-link.router-link-active { background: rgba(255,255,255,0.12); color: #fff; border-left: 3px solid #F48FB1; padding-left: calc(var(--sp-3) - 3px); }
.sidebar-footer {
  padding: var(--sp-4) var(--sp-4) 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: auto;
}
.sidebar-user { display: flex; align-items: center; gap: var(--sp-3); }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 0.82rem; color: #fff;
  flex-shrink: 0;
}
.user-name { font-size: 0.8rem; font-weight: 600; color: #fff; display: block; font-family: var(--font-display); }
.user-role { font-size: 0.68rem; color: rgba(255,255,255,0.35); display: block; }
</style>
