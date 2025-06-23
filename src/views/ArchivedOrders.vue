<!-- src/views/ArchivedOrders.vue -->
<template>
  <div class="page-container">
    <header class="page-header">
      <LucideArchive class="page-header__icon" />
      <h1 class="page-header__title">Ordens Arquivadas</h1>
      <span v-if="totalOrders > 0" class="page-header__badge">{{ totalOrders }} ordens</span>
    </header>

    <BaseCard class="filter-panel">
      <div class="search-box">
        <LucideSearch class="search-box__icon" />
        <input v-model="filters.text" type="search" placeholder="Buscar por cliente, nº da ordem ou descrição..."
          class="search-box__input" />
      </div>
      <div class="date-filter-group">
        <div class="date-filter">
          <label for="startDate">De:</label>
          <input id="startDate" v-model="filters.startDate" type="date" class="date-input" />
        </div>
        <div class="date-filter">
          <label for="endDate">Até:</label>
          <input id="endDate" v-model="filters.endDate" type="date" class="date-input" />
        </div>
      </div>
    </BaseCard>

    <BaseCard class="main-panel">
      <div class="table-container">
        <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nº Ordem</th>
              <th>Cliente</th>
              <th class="col--desc">Descrição</th>
              <th>Data de Criação</th>
              <th class="col--actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedOrders.length === 0 && !isLoading">
              <td colspan="5" class="data-table__cell--empty">Nenhuma ordem arquivada encontrada.</td>
            </tr>
            <tr v-for="order in paginatedOrders" :key="order.id" class="data-table__row">
              <td>{{ order.numeroOrdem }}</td>
              <td>{{ order.cliente }}</td>
              <td class="col--desc">{{ order.descricao }}</td>
              <td>{{ formatDate(order.dataAtual) }}</td>
              <td class="col--actions">
                <button @click="viewDetails(order.id)" class="btn-icon" title="Ver Detalhes da Ordem">
                  <LucideEye />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-container">
        <BaseButton @click="prevPage" :disabled="pagination.currentPage === 1" variant="update">Anterior</BaseButton>
        <span v-if="totalPages > 0">Página {{ pagination.currentPage }} de {{ totalPages }}</span>
        <BaseButton @click="nextPage" :disabled="pagination.currentPage >= totalPages" variant="update">Próxima
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import moment from 'moment-timezone';
import { LucideArchive, LucideSearch, LucideEye } from 'lucide-vue-next';
import BaseCard from '../components/Base/BaseCard.vue';
import BaseButton from '../components/Base/BaseButton.vue';

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

const fetchArchivedOrders = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const response = await axios.get(`${API_URL}/orders/archived`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allOrders.value = response.data.sort((a, b) => new Date(b.dataAtual) - new Date(a.dataAtual));
  } catch (err) {
    console.error("Erro ao carregar ordens arquivadas:", err);
  } finally {
    isLoading.value = false;
  }
};

const filteredOrders = computed(() => {
  pagination.currentPage = 1;
  const currentOrders = Array.isArray(allOrders.value) ? allOrders.value : [];

  return currentOrders.filter(order => {
    const textFilter = filters.text.toLowerCase();
    const matchText = !filters.text ||
      (order.numeroOrdem && String(order.numeroOrdem).toLowerCase().includes(textFilter)) ||
      (order.cliente && order.cliente.toLowerCase().includes(textFilter)) ||
      (order.descricao && order.descricao.toLowerCase().includes(textFilter));

    const startDate = filters.startDate ? moment(filters.startDate).startOf('day') : null;
    const endDate = filters.endDate ? moment(filters.endDate).endOf('day') : null;
    const orderDate = moment(order.dataAtual);

    const matchDate = (!startDate || orderDate.isSameOrAfter(startDate)) &&
      (!endDate || orderDate.isSameOrBefore(endDate));

    return matchText && matchDate;
  });
});

const totalOrders = computed(() => filteredOrders.value.length);
const totalPages = computed(() => Math.ceil(totalOrders.value / pagination.itemsPerPage) || 1);
const paginatedOrders = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const end = start + pagination.itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const formatDate = (dateString) => dateString ? moment.tz(dateString, "America/Sao_Paulo").format('DD/MM/YYYY') : 'N/A';
const viewDetails = (id) => router.push(`/ordem/${id}`);
const prevPage = () => { if (pagination.currentPage > 1) pagination.currentPage--; };
const nextPage = () => { if (pagination.currentPage < totalPages.value) pagination.currentPage++; };

onMounted(fetchArchivedOrders);
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
  color: var(--color-text-secondary);
  /* Cor para arquivado */
}

.page-header__title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.page-header__badge {
  background-color: var(--color-text-secondary);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

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
.date-input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  width: 100%;
}

.date-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
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

.date-input {
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-base);
}

.main-panel {
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  position: relative;
  min-height: 300px;
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
}

.data-table th {
  font-weight: var(--font-weight-bold);
  position: sticky;
  top: 0;
  z-index: 1;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  color: var(--color-button-update);
  background-color: color-mix(in srgb, var(--color-button-update) 15%, transparent);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--color-background-component) 80%, transparent);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-text-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
