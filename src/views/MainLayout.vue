<!-- src/views/MainLayout.vue -->
<template>
    <div class="app-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
        <header class="top-bar">
            <button class="top-bar__toggle" @click="toggleSidebar" aria-label="Toggle Sidebar">
                <LucideMenu class="icon" />
            </button>

            <div class="top-bar__brand">PATERNOLLI</div>

            <div class="top-bar__actions">
                <div class="top-bar__time" aria-live="polite">
                    {{ currentTime }}
                </div>

                <button class="top-bar__theme-toggle" @click="toggleTheme"
                    :aria-label="theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'">
                    <LucideMoon v-if="theme === 'light'" class="icon" />
                    <LucideSun v-else class="icon" />
                </button>

                <div class="user-profile" @click="toggleUserDropdown" ref="userDropdownRef">
                    <span class="username">Olá, {{ username }}</span>
                    <LucideUser class="icon" />
                    <transition name="fade">
                        <div v-if="showUserDropdown" class="user-dropdown">
                            <button @click="logout" class="dropdown-btn">Sair</button>
                        </div>
                    </transition>
                </div>
            </div>
        </header>

        <aside class="sidebar" :class="{ open: isSidebarOpen }">
            <nav class="sidebar__nav">
                <ul>
                    <li>
                        <router-link to="/" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideFileText class="icon" /><span>Ordens Abertas</span>
                        </router-link>
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/DashboardPanel" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideLayoutDashboard class="icon" /><span>Dashboard</span>
                        </router-link>
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/abertura-ordens" class="nav-link" @click="closeSidebarOnMobile">
                            <LucidePlusSquare class="icon" /><span>Abrir Ordem</span>
                        </router-link>
                    </li>
                    <li>
                        <hr class="nav-divider" />
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/cadastro-clientes" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideUsers class="icon" /><span>Clientes</span>
                        </router-link>
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/cadastro-servicos" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideSettings class="icon" /><span>Serviços</span>
                        </router-link>
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/register" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideUserPlus class="icon" /><span>Usuários</span>
                        </router-link>
                    </li>
                    <li>
                        <hr class="nav-divider" />
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/ordens-fechadas" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideArchive class="icon" /><span>Ordens Fechadas</span>
                        </router-link>
                    </li>
                    <li v-if="authState.isAdmin">
                        <router-link to="/ArchivedOrders" class="nav-link" @click="closeSidebarOnMobile">
                            <LucideArchive class="icon" /><span>Ordens Arquivadas</span>
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
import { useTheme } from "../composables/useTheme";
import { onClickOutside } from '@vueuse/core';
import axios from "axios";
import {
    LucideUser, LucideFileText, LucidePlusSquare, LucideSettings,
    LucideUsers, LucideUserPlus, LucideArchive, LucideSun,
    LucideMoon, LucideMenu, LucideLayoutDashboard
} from "lucide-vue-next";

const router = useRouter();
const { theme, toggleTheme } = useTheme();

const showUserDropdown = ref(false);
const isSidebarOpen = ref(window.innerWidth >= 768);
const currentTime = ref("");
const userDropdownRef = ref(null);

const username = computed(() => authState.currentUser?.username || "Usuário");

let clockInterval = null;

onMounted(() => {
    updateTime();
    clockInterval = setInterval(updateTime, 1000);
    validateUser();
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    if (clockInterval) clearInterval(clockInterval);
    window.removeEventListener("resize", handleResize);
});

onClickOutside(userDropdownRef, () => {
    showUserDropdown.value = false;
});

function handleResize() {
    isSidebarOpen.value = window.innerWidth >= 768;
}

function updateTime() {
    currentTime.value = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function validateUser() {
    if (!authState.isAuthenticated) return;
    const token = localStorage.getItem("authToken");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    try {
        const response = await axios.post(`${apiUrl}/auth/validate`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAuthenticated(true, response.data.user_type === 1, response.data);
    } catch (err) {
        console.error("Erro ao validar usuário:", err.message);
        logout();
    }
}

function toggleUserDropdown() {
    showUserDropdown.value = !showUserDropdown.value;
}

function logout() {
    showUserDropdown.value = false;
    localStorage.removeItem("authToken");
    setAuthenticated(false);
    router.push("/login");
}

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebarOnMobile() {
    if (window.innerWidth < 768) {
        isSidebarOpen.value = false;
    }
}
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.app-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    grid-template-rows: 64px 1fr;
    grid-template-areas:
        "top-bar top-bar"
        "sidebar main-content";
    height: 100vh;
    overflow: hidden;
    background-color: var(--color-background-base);
    transition: grid-template-columns 0.3s ease;
    scrollbar-width: none;
}

.app-layout.sidebar-collapsed {
    grid-template-columns: 80px 1fr;
}

/* --- TOP BAR --- */
.top-bar {
    grid-area: top-bar;
    background-color: var(--color-background-component);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-lg);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-card);
    border-bottom: 1px solid var(--color-border);
    z-index: 1100;
}

.top-bar__toggle {
    display: none;
    /* Visível apenas em mobile */
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    cursor: pointer;
}

.top-bar__brand {
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: 0.1em;
    color: var(--color-button-update);
}

.top-bar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
}

.top-bar__time {
    font-family: monospace;
    font-size: 1rem;
    font-weight: 700;
}

.top-bar__theme-toggle {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
}

.top-bar__theme-toggle:hover {
    color: var(--color-text-primary);
}

/* --- User Profile --- */
.user-profile {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    position: relative;
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: var(--color-background-component);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-card);
    min-width: 140px;
    z-index: 1200;
    border: 1px solid var(--color-border);
    overflow: hidden;
}

.dropdown-btn {
    width: 100%;
    background: transparent;
    border: none;
    padding: var(--space-sm) var(--space-md);
    cursor: pointer;
    font-weight: 600;
    text-align: left;
    color: var(--color-text-primary);
}

.dropdown-btn:hover {
    background: var(--color-button-delete);
    color: #fff;
}


/* --- SIDEBAR --- */
.sidebar {
    grid-area: sidebar;
    background: var(--color-background-component);
    color: var(--color-text-primary);
    display: flex;
    flex-direction: column;
    padding: var(--space-lg) 0;
    border-right: 1px solid var(--color-border);
    transition: transform 0.3s ease-in-out;
    overflow-y: auto;
}

.sidebar__nav ul {
    list-style: none;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
    color: var(--color-text-secondary);
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.2s ease, color 0.2s ease;
    white-space: nowrap;
}

.nav-link:hover {
    color: var(--color-text-primary);
}

.router-link-exact-active {
    background-color: var(--color-button-update);
    color: #fff !important;
}

.app-layout.sidebar-collapsed .nav-link span {
    display: none;
}

.app-layout.sidebar-collapsed .nav-link {
    justify-content: center;
}

.app-layout.sidebar-collapsed .top-bar__brand {
    display: none;
}

.nav-divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: var(--space-md) var(--space-lg);
}

/* --- ÍCONES --- */
.icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

/* --- MAIN CONTENT --- */
.main-content {
    grid-area: main-content;
    padding: 0;
    overflow-y: auto;
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 767px) {

    .app-layout,
    .app-layout.sidebar-collapsed {
        grid-template-columns: 1fr;
    }

    .sidebar {
        position: fixed;
        top: 64px;
        left: 0;
        width: 260px;
        height: calc(100vh - 64px);
        z-index: 1050;
        transform: translateX(-100%);
        border-right: 1px solid var(--color-border);
    }

    .sidebar.open {
        transform: translateX(0);
    }

    .top-bar__toggle {
        display: inline-flex;
    }

    .top-bar__brand,
    .username {
        display: none;
    }
}
</style>
