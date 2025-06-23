<template>
  <div class="app-layout" :class="{ 'dark-mode': isDarkMode, 'sidebar-collapsed': isSidebarCollapsed }">
    <header class="top-bar">
      <div class="top-bar__left">
        <button class="menu-toggle" @click="toggleSidebar" aria-label="Alternar menu">
          <LucideMenu />
        </button>
        <div class="top-bar__brand" @click="$router.push('/')">
          PATERNOLLI
        </div>
      </div>

      <div class="top-bar__right">
        <div class="top-bar__time" aria-label="Horário atual">{{ currentTime }}</div>

        <button class="theme-toggle" @click="toggleTheme"
          :aria-label="isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'">
          <transition name="fade" mode="out-in">
            <LucideSun v-if="isDarkMode" :key="'sun'" />
            <LucideMoon v-else :key="'moon'" />
          </transition>
        </button>

        <div class="user-profile" @click="toggleUserDropdown" ref="userDropdownRef">
          <span class="user-profile__name">Olá, {{ username }}</span>
          <LucideUser class="user-profile__icon" />
          <LucideChevronDown class="user-profile__chevron" :class="{ 'is-open': showUserDropdown }" />

          <transition name="slide-fade">
            <div v-if="showUserDropdown" class="user-dropdown">
              <button @click="logout" class="dropdown-item">
                <LucideLogOut class="dropdown-item__icon" /> Sair
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <aside class="sidebar">
      <nav class="sidebar__nav">
        <ul>
          <li>
            <router-link to="/" class="nav-link" data-tooltip="Ordens Abertas">
              <LucideFileText class="icon" />
              <span class="nav-link__text">Ordens Abertas</span>
            </router-link>
          </li>
          <li v-if="authState.isAdmin">
            <router-link to="/ArchivedOrders" class="nav-link" data-tooltip="Ordens Arquivadas">
              <LucideArchive class="icon" />
              <span class="nav-link__text">Ordens Arquivadas</span>
            </router-link>
          </li>
          <li v-if="authState.isAdmin">
            <router-link to="/abertura-ordens" class="nav-link" data-tooltip="Abrir Ordem">
              <LucidePlusSquare class="icon" />
              <span class="nav-link__text">Abrir Ordem</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { authState, setAuthenticated } from "../stores/authState";
import { useTheme } from "../composables/useTheme"; // <- Usando nosso composable de tema!
import { onClickOutside } from '@vueuse/core' // Lib útil para fechar dropdown
import axios from "axios";
import {
  LucideUser, LucideFileText, LucidePlusSquare, LucideArchive,
  LucideMenu, LucideSun, LucideMoon, LucideLogOut, LucideChevronDown
} from "lucide-vue-next";

// --- STATE MANAGEMENT ---
const router = useRouter();
const { isDarkMode, toggleTheme } = useTheme(); // <- Consistência!

const showUserDropdown = ref(false);
const isSidebarCollapsed = ref(false);
const currentTime = ref("");
const userDropdownRef = ref(null); // Ref para o elemento do dropdown

const username = computed(() => authState.currentUser?.username || "Usuário");

// --- LOGIC ---
function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value;
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function logout() {
  showUserDropdown.value = false;
  localStorage.removeItem("authToken");
  setAuthenticated(false);
  router.push("/login"); // <- Maneira correta de navegar
}

// Fecha o dropdown se clicar fora dele
onClickOutside(userDropdownRef, () => {
  showUserDropdown.value = false;
});

// --- LIFECYCLE & CLOCK ---
let clockInterval = null;
onMounted(() => {
  updateTime();
  clockInterval = setInterval(updateTime, 1000);
  validateUserOnLoad();
});

onBeforeUnmount(() => {
  clearInterval(clockInterval);
});

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function validateUserOnLoad() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    // Se não há token, não precisa fazer nada, o guard de rota vai agir
    return;
  }

  if (!authState.isAuthenticated) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.post(`${apiUrl}/auth/validate`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthenticated(true, response.data.user_type === 1, response.data);
    } catch (err) {
      console.error("Token inválido ou expirado:", err.message);
      logout(); // Desloga se o token for inválido
    }
  }
}
</script>

<style scoped>
/* ESTILOS REATORADOS - SEM VARIÁVEIS LOCAIS */

/* --- Layout Principal --- */
.app-layout {
  display: grid;
  /* As variáveis --sidebar-width e --topbar-height podem ser movidas para o design-system.css se desejar */
  --sidebar-width: 250px;
  --sidebar-width-collapsed: 80px;
  --topbar-height: 64px;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-areas:
    "top-bar top-bar"
    "sidebar main";
  height: 100vh;
  background-color: var(--color-background-base);
  /* GLOBAL */
  color: var(--color-text-primary);
  /* GLOBAL */
  transition: grid-template-columns 0.3s ease;
}

.app-layout.sidebar-collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

/* --- Top Bar --- */
.top-bar {
  grid-area: top-bar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background-color: var(--color-background-component);
  /* GLOBAL */
  border-bottom: 1px solid var(--color-border);
  /* GLOBAL */
  box-shadow: var(--shadow-card);
  /* GLOBAL */
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* ... resto dos seus estilos do top-bar, user-profile, etc., adaptados ... */
.top-bar__left,
.top-bar__right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle,
.theme-toggle {
  color: var(--color-text-secondary);
}

.menu-toggle:hover,
.theme-toggle:hover {
  background-color: var(--color-background-base);
  color: var(--color-text-primary);
}

.top-bar__brand {
  color: var(--color-button-update);
  /* Usando uma cor de destaque do sistema */
}

/* --- Sidebar --- */
.sidebar {
  grid-area: sidebar;
  background-color: var(--color-background-component);
  /* GLOBAL */
  border-right: 1px solid var(--color-border);
  /* GLOBAL */
  /* ... etc ... */
}

.nav-link {
  color: var(--color-text-secondary);
}

.nav-link:hover {
  background-color: var(--color-background-base);
  color: var(--color-text-primary);
}

.router-link-exact-active {
  background-color: var(--color-button-update);
  /* GLOBAL */
  color: white !important;
}

/* --- Main Content --- */
.main-content {
  grid-area: main;
  overflow-y: auto;
  padding: var(--space-xl);
  /* GLOBAL */
}
</style>
