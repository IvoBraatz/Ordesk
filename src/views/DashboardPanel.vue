<!-- src/views/DashboardPanel.vue -->
<template>
  <div class="dashboard-panel">
    <!-- Filtro -->
    <div class="filter-container">
      <button v-for="filter in filters" :key="filter.value" class="filter-option"
        :class="{ active: selectedFilter === filter.value }" @click="selectFilter(filter.value)" :disabled="isLoading">
        {{ filter.label }}
      </button>
    </div>

    <!-- Grid de Gráficos -->
    <div class="charts-grid">
      <!-- Gráfico 1: Visão Geral -->
      <DashboardCard title="Visão Geral das Ordens" :is-loading="isLoading" :error="error" :is-empty="isOrdersEmpty">
        <canvas ref="barCanvas"></canvas>
      </DashboardCard>

      <!-- Gráfico 2: Fechadas -->
      <DashboardCard title="Fechadas: Arquivadas vs Não Arquivadas" :is-loading="isLoading" :error="error"
        :is-empty="!orders.closed">
        <canvas ref="pieCanvas"></canvas>
      </DashboardCard>

      <!-- Gráfico 3: Ordens Abertas por Cliente -->
      <DashboardCard title="Top 10 Clientes (Ordens Abertas)" :is-loading="isLoading" :error="error"
        :is-empty="!openOrdersByClientData.length">
        <canvas ref="openOrdersByClientCanvas"></canvas>
      </DashboardCard>

      <!-- Gráfico 4: Serviços Mais Usados -->
      <DashboardCard title="Top 10 Serviços Mais Usados" :is-loading="isLoading" :error="error"
        :is-empty="!mostUsedServicesData.length">
        <canvas ref="mostUsedServicesCanvas"></canvas>
      </DashboardCard>

      <!-- Gráfico 5: Usuários com Mais Ordens -->
      <DashboardCard title="Ordens por Usuário" :is-loading="isLoading" :error="error" :is-empty="!userUsageData.length"
        class="grid-col-span-2 tall-chart">
        <canvas ref="userUsageCanvas"></canvas>
      </DashboardCard>

      <!-- Gráfico 6: Horas Trabalhadas -->
      <DashboardCard title="Horas Trabalhadas por Funcionário" :is-loading="isLoading" :error="error"
        :is-empty="!employeeHoursData.length" class="grid-col-span-2 tall-chart">
        <canvas ref="employeeHoursCanvas"></canvas>
      </DashboardCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import DashboardCard from '../components/DashboardCard.vue';
import { useTheme } from '../composables/useTheme';

Chart.register(...registerables);

// --- ESTADO ---
const { theme } = useTheme();
const isLoading = ref(true);
const error = ref(null);
const selectedFilter = ref('');
const filters = [
  { label: 'Todos', value: '' }, { label: 'Hoje', value: 'hoje' }, { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mês', value: 'mes' }, { label: 'Últimos 6 Meses', value: '6meses' }, { label: 'Último Ano', value: '1ano' },
];
const orders = ref({});
const openOrdersByClientData = ref([]);
const mostUsedServicesData = ref([]);
const userUsageData = ref([]);
const employeeHoursData = ref([]);

const barCanvas = ref(null), pieCanvas = ref(null), openOrdersByClientCanvas = ref(null),
  mostUsedServicesCanvas = ref(null), userUsageCanvas = ref(null), employeeHoursCanvas = ref(null);
let chartInstances = {};

// --- API ---
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

async function fetchAllDashboardData() {
  isLoading.value = true;
  error.value = null;
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};

  try {
    const endpoints = {
      orders: `/dashboards/orders/dashboard?filter=${selectedFilter.value}`,
      openByClient: `/dashboards/orders/open-by-client?filter=${selectedFilter.value}`,
      mostUsedServices: `/dashboards/order_services/most-used?filter=${selectedFilter.value}`,
      userUsage: `/dashboards/order_services/user-usage?filter=${selectedFilter.value}`,
      employeeHours: `/dashboards/order_services/employee-hours?filter=${selectedFilter.value}`,
    };

    const requests = Object.values(endpoints).map(endpoint => axios.get(`${apiUrl}${endpoint}`, getAuthHeaders()));
    const [ordersRes, openByClientRes, mostUsedServicesRes, userUsageRes, employeeHoursRes] = await Promise.all(requests);

    orders.value = ordersRes.data || {};
    openOrdersByClientData.value = Array.isArray(openByClientRes.data) ? openByClientRes.data : [];
    mostUsedServicesData.value = Array.isArray(mostUsedServicesRes.data) ? mostUsedServicesRes.data : [];
    userUsageData.value = Array.isArray(userUsageRes.data) ? userUsageRes.data : [];
    employeeHoursData.value = Array.isArray(employeeHoursRes.data) ? employeeHoursRes.data : [];

  } catch (err) {
    console.error("Falha ao carregar dados do dashboard:", err);
    error.value = "Não foi possível carregar os dados.";
  } finally {
    isLoading.value = false;
    nextTick(() => {
      renderAllCharts();
    });
  }
}

function selectFilter(filterValue) {
  selectedFilter.value = filterValue;
  fetchAllDashboardData();
}

// --- DADOS COMPUTADOS PARA GRÁFICOS ---
const isOrdersEmpty = computed(() => Object.keys(orders.value).length === 0 || !orders.value.total);

const chartData = computed(() => ({
  orders: {
    labels: ["Total", "Fechadas", "Abertas", "Arquivadas"],
    datasets: [{ label: "Ordens", data: [orders.value.total || 0, orders.value.closed || 0, orders.value.open || 0, orders.value.archived || 0] }],
  },
  closed: {
    labels: ["Arquivadas", "Não Arquivadas"],
    datasets: [{ data: [orders.value.closedArchived || 0, orders.value.closedNotArchived || 0] }],
  },
  openByClient: {
    labels: openOrdersByClientData.value.slice(0, 10).map(i => i.cliente),
    datasets: [{ data: openOrdersByClientData.value.slice(0, 10).map(i => i.openCount) }],
  },
  mostUsedServices: {
    labels: mostUsedServicesData.value.slice(0, 10).map(i => i.servico_nome),
    datasets: [{ data: mostUsedServicesData.value.slice(0, 10).map(i => i.usageCount) }],
  },
  userUsage: {
    labels: userUsageData.value.map(i => i.usuario_responsavel).reverse(),
    datasets: [{ label: "Ordens", data: userUsageData.value.map(i => i.count).reverse() }],
  },
  employeeHours: {
    labels: employeeHoursData.value.map(i => i.usuario_responsavel).reverse(),
    datasets: [{ label: "Horas Trabalhadas", data: employeeHoursData.value.map(i => parseFloat(i.total_hours)).reverse() }],
  },
}));

// --- RENDERIZAÇÃO DOS GRÁFICOS ---
const professionalPalette = [
  '#5E8B7E', '#4B739F', '#6A6A6A', '#7CB9A3', '#6993B8',
  '#A8A8A8', '#C04C4C', '#D66A6A', '#1F1F1F', '#2D2D2D',
];

function renderOrUpdateChart(canvasRef, name, type, data, options) {
  if (!canvasRef.value || !data?.datasets?.[0]?.data?.length) {
    if (chartInstances[name]) chartInstances[name].destroy();
    return;
  };
  const ctx = canvasRef.value.getContext('2d');

  data.datasets.forEach((dataset) => {
    if (type === 'pie' || type === 'doughnut') {
      dataset.backgroundColor = professionalPalette;
    } else {
      dataset.backgroundColor = theme.value === 'dark' ? '#6993B8' : '#4B739F';
    }
    dataset.borderColor = theme.value === 'dark' ? '#2A2A2C' : '#FFFFFF';
    dataset.borderWidth = 2;
  });

  if (chartInstances[name]) {
    chartInstances[name].data = data;
    chartInstances[name].options = options;
    chartInstances[name].update('none');
  } else {
    chartInstances[name] = new Chart(ctx, { type, data, options });
  }
}

const chartOptionsBarVertical = computed(() => createChartOptions(theme.value === 'dark', 'bar', 'x'));
const chartOptionsBarHorizontal = computed(() => createChartOptions(theme.value === 'dark', 'bar', 'y'));
const chartOptionsPie = computed(() => createChartOptions(theme.value === 'dark', 'pie'));

function renderAllCharts() {
  if (isLoading.value || error.value) return;
  renderOrUpdateChart(barCanvas, 'bar', 'bar', chartData.value.orders, chartOptionsBarVertical.value);
  renderOrUpdateChart(pieCanvas, 'pie', 'pie', chartData.value.closed, chartOptionsPie.value);
  renderOrUpdateChart(openOrdersByClientCanvas, 'openByClient', 'doughnut', chartData.value.openByClient, chartOptionsPie.value);
  renderOrUpdateChart(mostUsedServicesCanvas, 'mostUsedServices', 'doughnut', chartData.value.mostUsedServices, chartOptionsPie.value);
  renderOrUpdateChart(userUsageCanvas, 'userUsage', 'bar', chartData.value.userUsage, chartOptionsBarHorizontal.value);
  renderOrUpdateChart(employeeHoursCanvas, 'employeeHours', 'bar', chartData.value.employeeHours, chartOptionsBarHorizontal.value);
}

// --- LIFECYCLE & WATCHERS ---
onMounted(fetchAllDashboardData);
watch(theme, renderAllCharts);

// --- HELPERS ---
function createChartOptions(isDark, chartType = 'bar', indexAxis = 'x') {
  const textColor = isDark ? '#F0F0F0' : '#1F1F1F';
  const gridColor = isDark ? '#3C3C3C' : '#D1D1D1';

  const options = {
    indexAxis,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: 5 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF',
        titleColor: textColor, bodyColor: textColor,
        borderColor: gridColor, borderWidth: 1, padding: 10, cornerRadius: 4,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (context.parsed.y !== null && indexAxis === 'x') {
              label += `: ${context.parsed.y}`;
            }
            if (context.parsed.x !== null && indexAxis === 'y') {
              label += `: ${context.parsed.x}`;
            }
            if (context.chart.config.type === 'pie' || context.chart.config.type === 'doughnut') {
              const sum = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = sum > 0 ? ((context.parsed / sum) * 100).toFixed(1) + '%' : '0%';
              return ` ${context.label}: ${percentage} (${context.parsed})`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: { display: (chartType === 'bar'), ticks: { color: textColor, autoSkip: false }, grid: { drawOnChartArea: (indexAxis === 'x'), color: gridColor } },
      x: { display: (chartType === 'bar'), ticks: { color: textColor }, grid: { drawOnChartArea: (indexAxis === 'y'), color: gridColor } }
    }
  };

  if (chartType === 'pie' || chartType === 'doughnut') {
    delete options.scales;
    options.plugins.legend.display = true;
    options.plugins.legend.position = 'bottom';
    options.plugins.legend.labels = { color: textColor };
  }

  return options;
}
</script>

<style scoped>
/* Estilos agora usando as variáveis globais do design-system.css */
.dashboard-panel {
  padding: var(--space-lg);
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.filter-option {
  background-color: var(--color-background-component);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: var(--space-sm) var(--space-md);
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
  transition: all 0.2s ease;
}

.filter-option:hover:not(:disabled) {
  border-color: var(--color-button-update);
  color: var(--color-button-update);
}

.filter-option.active {
  background-color: var(--color-button-update);
  color: #fff;
  border-color: var(--color-button-update);
}

.filter-option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.grid-col-span-2 {
  grid-column: span 2;
}

:deep(.tall-chart .card-content) {
  height: 500px;
  overflow-y: auto;
}

@media (max-width: 900px) {
  .grid-col-span-2 {
    grid-column: span 1;
  }
}
</style>
