<!-- src/views/PaginaOrdensFechadas.vue -->
<template>
  <div class="page-container">
    <header class="page-header">
      <LucideCheckCheck class="page-header__icon" />
      <h1 class="page-header__title">Histórico de Ordens Finalizadas</h1>
      <span class="page-header__badge">{{ totalOrders }} ordens</span>
    </header>

    <!-- Usando BaseCard para o painel de filtros -->
    <BaseCard class="filter-panel">
      <div class="search-box">
        <LucideSearch class="search-box__icon" />
        <input v-model="filters.text" type="search" placeholder="Buscar por cliente, nº da ordem ou descrição..."
          class="search-box__input" />
      </div>
      <div class="date-filter">
        <label for="startDate">De:</label>
        <input id="startDate" v-model="filters.startDate" type="date" class="date-filter__input" />
      </div>
      <div class="date-filter">
        <label for="endDate">Até:</label>
        <input id="endDate" v-model="filters.endDate" type="date" class="date-filter__input" />
      </div>
    </BaseCard>

    <main class="main-panel">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nº Ordem</th>
              <th>Cliente</th>
              <th class="col--desc">Descrição</th>
              <th>Data Finalização</th>
              <th class="col--actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedOrders.length === 0">
              <td colspan="5" class="data-table__cell--empty">Nenhuma ordem encontrada para os filtros aplicados.</td>
            </tr>
            <tr v-for="order in paginatedOrders" :key="order.id" class="data-table__row">
              <td>{{ order.numeroOrdem }}</td>
              <td>{{ order.cliente }}</td>
              <td class="col--desc">{{ order.descricao }}</td>
              <td>{{ formatDate(order.dataFinalizacao) }}</td>
              <td class="col--actions">
                <button @click="viewDetails(order.id)" class="btn-icon" title="Ver Detalhes">
                  <LucideEye />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-container">
        <!-- Usando BaseButton para paginação -->
        <BaseButton @click="prevPage" :disabled="pagination.currentPage === 1" variant="update">Anterior</BaseButton>
        <span>Página {{ pagination.currentPage }} de {{ totalPages }}</span>
        <BaseButton @click="nextPage" :disabled="pagination.currentPage === totalPages" variant="update">Próxima
        </BaseButton>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import moment from 'moment-timezone';
import { LucideCheckCheck, LucideSearch, LucideEye } from 'lucide-vue-next';
// Importando componentes base
import BaseCard from '../components/Base/BaseCard.vue';
import BaseButton from '../components/Base/BaseButton.vue';

// A lógica do script foi mantida, pois já era bem estruturada.
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const allOrders = ref([]);
const isLoading = ref(true);

const filters = reactive({
  text: '',
  startDate: '',
  endDate: '',
});

const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 15,
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const response = await axios.get(`${API_URL}/orders/finalized`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allOrders.value = response.data.sort((a, b) => new Date(b.dataFinalizacao) - new Date(a.dataFinalizacao));
  } catch (err) {
    console.error("Erro ao carregar ordens finalizadas:", err);
  } finally {
    isLoading.value = false;
  }
};

const filteredOrders = computed(() => {
  return allOrders.value.filter(order => {
    const textFilter = filters.text.toLowerCase();
    const matchText = !filters.text ||
      (order.numeroOrdem?.toString().includes(textFilter)) ||
      (order.cliente?.toLowerCase().includes(textFilter)) ||
      (order.descricao?.toLowerCase().includes(textFilter));

    const startDate = filters.startDate ? moment.tz(filters.startDate, 'America/Sao_Paulo').startOf('day') : null;
    const endDate = filters.endDate ? moment.tz(filters.endDate, 'America/Sao_Paulo').endOf('day') : null;
    const orderDate = moment.tz(order.dataFinalizacao, 'America/Sao_Paulo');

    const matchDate = (!startDate || orderDate.isSameOrAfter(startDate)) &&
      (!endDate || orderDate.isSameOrBefore(endDate));

    return matchText && matchDate;
  });
});

const totalOrders = computed(() => filteredOrders.value.length);
const totalPages = computed(() => Math.ceil(totalOrders.value / pagination.itemsPerPage));

const paginatedOrders = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const end = start + pagination.itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return moment.tz(dateString, 'America/Sao_Paulo').format('DD/MM/YYYY');
};
const viewDetails = (id) => router.push(`/ordem/${id}`);
const prevPage = () => { if (pagination.currentPage > 1) pagination.currentPage--; };
const nextPage = () => { if (pagination.currentPage < totalPages.value) pagination.currentPage++; };

onMounted(fetchOrders);
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.page-container {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.page-header__icon {
  width: 32px;
  height: 32px;
  color: var(--color-button-create);
  /* Cor de sucesso */
}

.page-header__title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-header__badge {
  background-color: var(--color-button-create);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* Painel de Filtros */
.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  align-items: center;
  margin-bottom: var(--space-lg);
}

.search-box {
  flex-grow: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background-color: var(--color-background-base);
  border: 1px solid var(--color-border);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
}

.search-box:focus-within {
  border-color: var(--color-button-update);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-button-update) 20%, transparent);
}

.search-box__icon {
  color: var(--color-text-secondary);
}

.search-box__input,
.date-filter__input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  width: 100%;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.date-filter label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.date-filter__input {
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-base);
}

/* Painel Principal (Tabela) */
.main-panel {
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.table-container {
  overflow: auto;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
  overflow: hidden;
}

.data-table th {
  font-weight: var(--font-weight-bold);
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background-component);
  border-bottom-width: 2px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: var(--font-size-sm);
}

.data-table tr:hover {
  background-color: var(--color-background-base);
}

.col--desc {
  width: 40%;
  max-width: 400px;
}

.col--actions {
  text-align: center;
}

.data-table__cell--empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

/* Paginação */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.btn-icon {
  display: inline-flex;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--space-sm);
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-icon:hover {
  color: var(--color-button-create);
  background-color: color-mix(in srgb, var(--color-button-create) 15%, transparent);
}

/* Utilitários */
.loading-overlay {
  /* ... */
}

.spinner {
  /* ... */
}
</style>
