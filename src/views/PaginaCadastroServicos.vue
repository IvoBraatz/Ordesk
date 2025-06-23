<!-- src/views/PaginaCadastroServicos.vue -->
<template>
  <div class="page-container">
    <header class="page-header">
      <LucideSettings class="page-header__icon" />
      <h1 class="page-header__title">Gestão de Serviços</h1>
    </header>

    <div class="main-layout">
      <!-- PAINEL LATERAL COM FORMULÁRIOS -->
      <aside class="side-panel">
        <BaseCard>
          <h2 class="form-title">
            {{ isEditingId ? 'Editando Serviço' : 'Novo Serviço' }}
          </h2>
          <form @submit.prevent="handleSubmit" class="service-form">
            <BaseInput label="Centro de Custo" v-model="form.centroDeCusto" required />
            <div class="form-group">
              <label for="descricao">Descrição do Serviço</label>
              <textarea id="descricao" v-model="form.descricao" rows="4" required class="ru-textarea"></textarea>
            </div>
            <BaseInput label="Valor (R$)" type="number" step="0.01" min="0" v-model="form.valor" required />

            <div class="form-actions">
              <BaseButton v-if="isEditingId" type="button" @click="cancelEdit" variant="delete">
                Cancelar
              </BaseButton>
              <BaseButton type="submit" :variant="isEditingId ? 'update' : 'create'">
                <LucideSave v-if="isEditingId" />
                <LucidePlusCircle v-else />
                {{ isEditingId ? 'Salvar' : 'Adicionar' }}
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      </aside>

      <!-- PAINEL PRINCIPAL COM A LISTA -->
      <main class="main-panel">
        <div class="list-header">
          <div class="search-box">
            <LucideSearch class="search-box__icon" />
            <input type="search" v-model="searchTerm" placeholder="Pesquisar serviços..." class="search-box__input" />
          </div>
          <BaseButton @click="handleDeleteSelected" variant="delete" :disabled="selectedServices.length === 0">
            <LucideTrash />
            Excluir ({{ selectedServices.length }})
          </BaseButton>
        </div>

        <div class="table-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-select">
                  <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
                </th>
                <th>Centro de Custo</th>
                <th>Descrição</th>
                <th class="col-valor">Valor</th>
                <th class="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredServices.length === 0">
                <td :colspan="5" class="no-data">Nenhum serviço encontrado.</td>
              </tr>
              <tr v-for="service in filteredServices" :key="service.id">
                <td class="col-select">
                  <input type="checkbox" :value="service.id" v-model="selectedServices" />
                </td>
                <td>{{ service.centroDeCusto }}</td>
                <td>{{ service.descricao }}</td>
                <td class="col-valor">{{ formatCurrency(service.valor) }}</td>
                <td class="col-actions">
                  <button @click="startEdit(service)" class="btn-icon" title="Editar Serviço">
                    <LucidePencil />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import {
  LucideSettings, LucidePlusCircle, LucideSave,
  LucideTrash, LucideSearch, LucidePencil,
} from 'lucide-vue-next';
// Importando os componentes Base
import BaseInput from '../components/Base/BaseInput.vue';
import BaseButton from '../components/Base/BaseButton.vue';
import BaseCard from '../components/Base/BaseCard.vue';

const router = useRouter();
const services = ref([]);
const isLoading = ref(true);
const searchTerm = ref('');
const selectedServices = ref([]);
const isEditingId = ref(null);

const form = reactive({
  centroDeCusto: '',
  descricao: '',
  valor: null,
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_TOKEN = localStorage.getItem('authToken');

const resetForm = () => {
  isEditingId.value = null;
  form.centroDeCusto = '';
  form.descricao = '';
  form.valor = null;
};

const startEdit = (service) => {
  isEditingId.value = service.id;
  form.centroDeCusto = service.centroDeCusto;
  form.descricao = service.descricao;
  form.valor = service.valor;
};

const cancelEdit = () => resetForm();

const handleSubmit = async () => {
  if (!form.centroDeCusto || !form.descricao || form.valor == null || form.valor < 0) {
    // Idealmente, usar um componente de notificação
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  const payload = {
    centroDeCusto: form.centroDeCusto.trim(),
    descricao: form.descricao.trim(),
    valor: Number(form.valor),
  };

  try {
    if (isEditingId.value) {
      await axios.put(`${API_URL}/services/${isEditingId.value}`, payload, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      // alert('Serviço atualizado com sucesso!');
    } else {
      await axios.post(`${API_URL}/services`, payload, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      // alert('Serviço cadastrado com sucesso!');
    }
    resetForm();
    await fetchServices();
  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    alert('Ocorreu um erro ao salvar o serviço.');
  }
};

const fetchServices = async () => {
  isLoading.value = true;
  if (!AUTH_TOKEN) {
    router.push('/login');
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/services`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    services.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
    if (error.response?.status === 401) {
      alert("Sessão expirada. Faça o login novamente.");
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteSelected = async () => {
  if (!confirm(`Tem certeza que deseja excluir ${selectedServices.value.length} serviço(s)?`)) return;

  const promises = selectedServices.value.map(id =>
    axios.delete(`${API_URL}/services/${id}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
  );

  try {
    await Promise.all(promises);
    selectedServices.value = [];
    await fetchServices();
  } catch (error) {
    console.error('Erro ao excluir serviços:', error);
    alert('Ocorreu um erro ao excluir os serviços.');
  }
};

const filteredServices = computed(() => {
  if (!searchTerm.value) {
    return services.value;
  }
  const term = searchTerm.value.toLowerCase();
  return services.value.filter(
    s =>
      s.centroDeCusto.toLowerCase().includes(term) ||
      s.descricao.toLowerCase().includes(term)
  );
});

const isAllSelected = computed({
  get: () =>
    filteredServices.value.length > 0 &&
    selectedServices.value.length === filteredServices.value.length,
  set: (value) => {
    if (value) {
      selectedServices.value = filteredServices.value.map(s => s.id);
    } else {
      selectedServices.value = [];
    }
  }
});

const toggleSelectAll = (event) => {
  isAllSelected.value = event.target.checked;
};

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

onMounted(fetchServices);
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

.page-header svg {
  width: 32px;
  height: 32px;
  color: var(--color-button-update);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.main-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: var(--space-lg);
  align-items: flex-start;
}

/* Painel do Formulário (Esquerda) */
.side-panel {
  flex: 1 1 420px;
  min-width: 380px;
  /* A propriedade 'position: sticky' foi removida para resolver o conflito de layout. */
  /* A propriedade 'top' também foi removida por não ser mais necessária. */
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group label {
  /* Estilo para o label da textarea */
  display: block;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.ru-textarea {
  /* Textarea estilizada como o BaseInput */
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-background-component);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
}

.ru-textarea:focus {
  outline: none;
  border-color: var(--color-button-update);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-button-update) 20%, transparent);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

/* Painel da Lista (Direita) */
.main-panel {
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background-color: var(--color-background-base);
  border: 1px solid var(--color-border);
  padding: 0.25rem var(--space-md);
  border-radius: 20px;
}

.search-wrapper input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.search-wrapper svg {
  color: var(--color-text-secondary);
}

.table-container {
  overflow-x: auto;
  position: relative;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: left;
  padding: var(--space-md) var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: color-mix(in srgb, var(--color-background-component) 85%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

td {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

tbody tr:hover {
  background-color: var(--color-background-base);
}

.col-select {
  width: 5%;
  text-align: center;
}

.col-valor {
  width: 20%;
  text-align: right;
}

.col-actions {
  width: 10%;
  text-align: center;
}

.no-data {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.btn-icon {
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
  border-top-color: var(--color-button-update);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: static;
  }
}
</style>
