<!-- src/views/PaginaOrdemDetalhes.vue -->
<template>
  <div class="page-container">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Carregando detalhes da ordem...</p>
    </div>

    <div v-else-if="order" class="details-layout">
      <!-- 
        Os componentes filhos já foram refatorados e herdarão o tema
        automaticamente através do nosso sistema de design.
      -->
      <DetalhesOrdem :ordem="order" :auth-state="authState" @update:ordem="handleOrderUpdate"
        @ordem-arquivada="handleOrderArchived" />
      <ServicosOrdem 
        :ordem="order"
        :servicos-ordenados="availableServices"
        :servicos-adicionados="addedServices"
        :usuarios="users"
        :tempos-disponiveis-select="temposDisponiveisSelect"
        :auth-state="authState"
        @update:servicosAdicionados="handleServicesUpdate" 
      />
      <ImagensOrdem :ordem="order" @ordem-finalizada="handleOrderFinalized" />
    </div>

    <div v-else class="empty-state">
      <h1 class="empty-state__title">Ordem não encontrada</h1>
      <p class="empty-state__message">A ordem que você está tentando acessar não existe ou não pôde ser carregada.</p>
      <!-- Usando nosso BaseButton para uma aparência consistente -->
      <BaseButton variant="create" @click="goHome">Voltar para o Início</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
// Os componentes filhos
import DetalhesOrdem from '../components/DetalhesOrdem.vue';
import ServicosOrdem from '../components/ServicosOrdem.vue';
import ImagensOrdem from '../components/ImagensOrdem.vue';
// Nosso componente BaseButton para o estado vazio
import BaseButton from '../components/Base/BaseButton.vue';
import { authState } from '../stores/authState';

// O 'useTheme' não é mais necessário aqui, pois o tema é global.
const route = useRoute();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const order = ref(null);
const availableServices = ref([]);
const addedServices = ref([]);
const users = ref([]);
const clients = ref([]);
const isLoading = ref(true);

// Array de tempos disponíveis
const temposDisponiveisSelect = [
  "00:05", "00:10", "00:15", "00:20", "00:25", "00:30", "00:35", "00:40", "00:45", "00:50", "00:55",
  "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30",
  "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00"
];

// A lógica do script foi mantida, pois já era bem estruturada.
const fetchData = async () => {
  isLoading.value = true;
  const orderId = route.params.id;
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/login');
    return;
  }
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const [orderRes, servicesRes, availableServicesRes, usersRes, clientsRes] = await Promise.all([
      axios.get(`${API_URL}/orders/${orderId}`, config),
      axios.get(`${API_URL}/orders/${orderId}/services`, config),
      axios.get(`${API_URL}/services`, config),
      axios.get(`${API_URL}/auth/users`, config),
      axios.get(`${API_URL}/customers`, config),
    ]);
    order.value = orderRes.data;
    addedServices.value = servicesRes.data;
    availableServices.value = availableServicesRes.data;
    users.value = usersRes.data;
    clients.value = clientsRes.data;
  } catch (err) {
    console.error("Erro ao carregar os dados da ordem:", err);
    order.value = null;
  } finally {
    isLoading.value = false;
  }
};

const handleOrderUpdate = (updatedOrder) => {
  order.value = { ...order.value, ...updatedOrder };
};
const handleServicesUpdate = (updatedServices) => {
  addedServices.value = updatedServices;
};
const handleOrderFinalized = () => {
  // TODO: Substituir por um componente de notificação
  alert('Ordem finalizada com sucesso!');
  router.push('/');
};
const handleOrderArchived = async () => {
  // TODO: Substituir por um modal de confirmação
  if (!order.value || !confirm('Tem certeza que deseja arquivar esta ordem?')) return;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_URL}/orders/${order.value.id}/archive`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    order.value = response.data;
    alert('Ordem arquivada com sucesso!');
  } catch (err) {
    console.error("Erro ao arquivar a ordem:", err);
    alert("Ocorreu um erro ao tentar arquivar a ordem.");
  }
};
const goHome = () => {
  router.push('/');
};

onMounted(fetchData);
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.page-container {
  background-color: var(--color-background-base);
  padding: var(--space-lg);
  min-height: 100%;
}

.details-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-width: 1280px;
  margin: 0 auto;
}

/* --- Estados de Carregamento e Vazio --- */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  inset: 0;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-xl);
  margin-top: var(--space-xl);
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-card);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.empty-state__message {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: var(--space-md) 0 var(--space-lg) 0;
  max-width: 450px;
}
</style>
