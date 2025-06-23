<!-- ARQUIVO: src/views/PaginaAtendimentoOrdens.vue -->
<template>
  <div class="page-container">
    <div class="header-info">
      <h1 class="title-page">Ordens Pendentes</h1>
      <div class="total-orders">
        Total de Ordens Abertas: <strong>{{ totalOpenOrders }}</strong>
      </div>
      <div class="totals">
        <div class="priority-count priority--urgent">
          Urgente: <strong>{{ categorizedOrders.urgente.length }}</strong>
        </div>
        <div class="priority-count priority--high">
          Alta: <strong>{{ categorizedOrders.alta.length }}</strong>
        </div>
        <div class="priority-count priority--medium">
          Média: <strong>{{ categorizedOrders.media.length }}</strong>
        </div>
        <div class="priority-count priority--low">
          Baixa: <strong>{{ categorizedOrders.baixa.length }}</strong>
        </div>
      </div>
    </div>

    <!-- Filtros com layout corrigido -->
    <BaseCard class="filters-wrapper">
      <div class="search-bar">
        <!-- Usando BaseInput para manter o estilo padrão -->
        <BaseInput as="input" id="searchInput" v-model="filterText" type="text"
          placeholder="Buscar por cliente, descrição ou nº da ordem" label="Pesquisar" />
      </div>
      <div class="date-filters">
        <div class="date-filter-item">
          <BaseInput as="input" v-model="startDate" type="date" id="startDate" label="De:" />
        </div>
        <div class="date-filter-item">
          <BaseInput as="input" v-model="endDate" type="date" id="endDate" label="Até:" />
        </div>
      </div>
    </BaseCard>

    <main class="main-content">
      <div v-if="isLoading" class="state-feedback">
        <div class="spinner"></div>
        <p>Carregando ordens...</p>
      </div>

      <div v-else-if="filteredOrders.length > 0" class="priority-groups-container">
        <OrderCarousel v-if="categorizedOrders.urgente.length > 0" title="Urgente" :orders="categorizedOrders.urgente"
          priority-class="priority--urgent" />
        <OrderCarousel v-if="categorizedOrders.alta.length > 0" title="Alta" :orders="categorizedOrders.alta"
          priority-class="priority--high" />
        <OrderCarousel v-if="categorizedOrders.media.length > 0" title="Média" :orders="categorizedOrders.media"
          priority-class="priority--medium" />
        <OrderCarousel v-if="categorizedOrders.baixa.length > 0" title="Baixa" :orders="categorizedOrders.baixa"
          priority-class="priority--low" />
      </div>

      <div v-else class="state-feedback">
        <p>Nenhuma ordem pendente encontrada para os filtros aplicados.</p>
      </div>
    </main>

    <!-- Modal (sem alterações) -->
    <transition name="fade">
      <div v-if="newlyAddedOrder" class="modal-overlay" @click="newlyAddedOrder = null">
        <div class="modal-content" :class="getPriorityClass(newlyAddedOrder.priority)">
          <div class="modal-header">
            <h2 class="modal-title">Nova Ordem Recebida!</h2>
            <button class="close-button" @click="newlyAddedOrder = null">
              <LucideX size="24" />
            </button>
          </div>
          <div class="modal-body">
            <p><strong>Ordem:</strong> #{{ newlyAddedOrder.numeroOrdem }}</p>
            <p><strong>Prioridade:</strong> {{ newlyAddedOrder.priority }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import moment from 'moment-timezone';
import { LucideX } from 'lucide-vue-next';
import OrderCarousel from '../components/OrderCarousel.vue';
import BaseCard from '../components/Base/BaseCard.vue';
import BaseInput from '../components/Base/BaseInput.vue';

const allOrders = ref([]); const newlyAddedOrder = ref(null); const filterText = ref(''); const startDate = ref(''); const endDate = ref(''); const isLoading = ref(true); let pollingInterval = null; const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; const getPriorityForOrder = (prazoEntrega) => { const hoje = moment().tz('America/Sao_Paulo'); const prazo = moment.tz(prazoEntrega, 'YYYY-MM-DD', 'America/Sao_Paulo').endOf('day'); const diasRestantes = prazo.diff(hoje, 'days'); if (diasRestantes <= 3) return 'Urgente'; if (diasRestantes <= 6) return 'Alta'; if (diasRestantes <= 9) return 'Média'; return 'Baixa'; }; const getPriorityClass = (priority) => { const map = { Urgente: 'priority--urgent', Alta: 'priority--high', Média: 'priority--medium', Baixa: 'priority--low' }; return map[priority] || ''; }; const filteredOrders = computed(() => { return allOrders.value.filter(ordem => { if (Number(ordem.finalizada) === 1 || Number(ordem.archived) === 1) return false; const textMatch = !filterText.value || [ordem.cliente, ordem.descricao, ordem.numeroOrdem].filter(Boolean).some(campo => String(campo).toLowerCase().includes(filterText.value.toLowerCase())); const date = moment.tz(ordem.dataAtual, 'America/Sao_Paulo'); const startMatch = !startDate.value || date.isSameOrAfter(moment.tz(startDate.value, 'America/Sao_Paulo').startOf('day')); const endMatch = !endDate.value || date.isSameOrBefore(moment.tz(endDate.value, 'America/Sao_Paulo').endOf('day')); return textMatch && startMatch && endMatch; }); }); const categorizedOrders = computed(() => { const categories = { urgente: [], alta: [], media: [], baixa: [] }; const priorityMap = { 'Urgente': 'urgente', 'Alta': 'alta', 'Média': 'media', 'Baixa': 'baixa' }; for (const ordem of filteredOrders.value) { const priority = getPriorityForOrder(ordem.prazoEntrega); ordem.priority = priority; const priorityKey = priorityMap[priority]; if (categories[priorityKey]) categories[priorityKey].push(ordem); } return categories; }); const totalOpenOrders = computed(() => filteredOrders.value.length); const fetchOrders = async () => { isLoading.value = true; try { const response = await axios.get(`${API_URL}/orders/open`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, 'Cache-Control': 'no-cache' } }); const uniqueOrders = new Map(response.data.map(o => [o.id, o])); allOrders.value = Array.from(uniqueOrders.values()); } catch (err) { console.error('Erro ao carregar as ordens:', err); } finally { isLoading.value = false; } }; const startPolling = () => { pollingInterval = setInterval(async () => { try { const response = await axios.get(`${API_URL}/orders/open`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, 'Cache-Control': 'no-cache' } }); const currentIds = new Set(allOrders.value.map(o => o.id)); const newOrders = response.data.filter(ordem => !currentIds.has(ordem.id)); if (newOrders.length > 0) { const orderToShow = newOrders[0]; orderToShow.priority = getPriorityForOrder(orderToShow.prazoEntrega); newlyAddedOrder.value = orderToShow; allOrders.value.push(...newOrders); setTimeout(() => { newlyAddedOrder.value = null; }, 5000); } } catch (err) { console.error('Erro durante o polling:', err); } }, 5000); }; onMounted(() => { fetchOrders(); startPolling(); }); onUnmounted(() => { clearInterval(pollingInterval); });
</script>

<style scoped>
.page-container {
  padding: var(--space-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  scrollbar-width: none;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  /* Pequeno padding para a barra de rolagem não colar no conteúdo */
  padding: 5px var(--space-sm) 5px 5px;
  scrollbar-width: none;
}

.priority-groups-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.header-info {
  text-align: center;
  flex-shrink: 0;
}

.title-page {
  font-size: 2rem;
  margin-bottom: var(--space-xs);
  font-weight: 700;
}

.total-orders {
  font-size: 1.1rem;
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
}

.totals {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  font-size: var(--font-size-sm);
}

.priority-count {
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  font-weight: 500;
  color: #fff;
}

.priority--urgent {
  background-color: var(--color-priority-urgent);
}

.priority--high {
  background-color: var(--color-priority-high);
}

.priority--medium {
  background-color: var(--color-priority-medium);
  color: var(--color-text-primary);
}

.priority--low {
  background-color: var(--color-priority-low);
}

/* --- SEÇÃO DE FILTROS CORRIGIDA --- */
.filters-wrapper {
  padding: var(--space-lg);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-lg);
  flex-shrink: 0;
}

.search-bar {
  flex: 2 1 350px;
  /* A CHAVE: Permite que o item encolha abaixo do tamanho de seu conteúdo, resolvendo o overflow. */
  min-width: 0;
}

.date-filters {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--space-md);
  flex: 1 1 300px;
}

.date-filter-item {
  flex: 1;
  min-width: 140px;
}

/* Feedback de Estado */
.state-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
  font-weight: 500;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-button-update);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: var(--color-background-component);
  padding: var(--space-xl);
  position: relative;
  animation: fadeInUp 0.4s ease forwards;
  border-top: 10px solid;
  border-radius: var(--border-radius-md);
  width: 90vw;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  color: #fff;
}

.modal-body {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-content.priority--urgent .modal-title {
  color: var(--color-priority-urgent);
}

.modal-content.priority--high .modal-title {
  color: var(--color-priority-high);
}

.modal-content.priority--medium .modal-title {
  color: var(--color-priority-medium);
}

.modal-content.priority--low .modal-title {
  color: var(--color-priority-low);
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
