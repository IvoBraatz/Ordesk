estilos melhorados mas quebrou a pagina de cadastro de usuários e serviç… …oes precisa
arrumar, também os serviços da ordem e verificar responsividade b1ea388
src\views\PaginaCadastroClientes.vue @@ -1,437 +1,446 @@
<template>
  <div class="page-container">
    <header class="page-header">
      <LucideUserPlus />
      <h1>Gestão de Clientes</h1>
    </header>

    <div class="main-layout">
      <aside class="form-panel">
        <h2 class="panel-title">
          {{ isEditingId ? "Editando Cliente" : "Novo Cliente" }}
        </h2>

        <form @submit.prevent="handleSubmit" class="client-form">
          <fieldset>
            <legend>Dados Principais</legend>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label for="codigoCliente">Código do Cliente *</label>
                <input
                  id="codigoCliente"
                  type="text"
                  v-model="form.codigoCliente"
                  required
                />
              </div>
              <div class="form-group col-span-4">
                <label for="nome">Nome Completo *</label>
                <input id="nome" type="text" v-model="form.nome" required />
              </div>
              <div class="form-group col-span-3">
                <label for="telefone">Telefone *</label>
                <input
                  id="telefone"
                  type="tel"
                  v-model="form.telefone"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div class="form-group col-span-3">
                <label for="tipoDocumento">Tipo de Documento *</label>
                <select id="tipoDocumento" v-model="form.tipoDocumento" required>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                </select>
              </div>
              <div class="form-group col-span-6">
                <label for="cpfCnpj">CPF ou CNPJ *</label>
                <input id="cpfCnpj" type="text" v-model="form.cpfCnpj" required />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Endereço</legend>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label for="cep">CEP *</label>
                <div class="cep-wrapper">
                  <input
                    id="cep"
                    type="text"
                    v-model="form.cep"
                    @blur="fetchAddressByCep"
                    required
                  />
                  <div v-if="isCepLoading" class="spinner-cep"></div>
                </div>
              </div>
              <div class="form-group col-span-4">
                <label for="rua">Rua *</label>
                <input id="rua" type="text" v-model="form.rua" required />
              </div>
              <div class="form-group col-span-2">
                <label for="numero">Número *</label>
                <input id="numero" type="text" v-model="form.numero" required />
              </div>
              <div class="form-group col-span-4">
                <label for="complemento">Complemento</label>
                <input id="complemento" type="text" v-model="form.complemento" />
              </div>
              <div class="form-group col-span-3">
                <label for="bairro">Bairro *</label>
                <input id="bairro" type="text" v-model="form.bairro" required />
              </div>
              <div class="form-group col-span-3">
                <label for="cidade">Cidade *</label>
                <input id="cidade" type="text" v-model="form.cidade" required />
              </div>
              <div class="form-group col-span-3">
                <label for="estado">Estado *</label>
                <input id="estado" type="text" v-model="form.estado" required />
              </div>
              <div class="form-group col-span-3">
                <label for="pais">País *</label>
                <input id="pais" type="text" v-model="form.pais" required />
              </div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button
              v-if="isEditingId"
              type="button"
              @click="cancelEdit"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <LucideSave />
              {{ isEditingId ? "Salvar Alterações" : "Cadastrar Cliente" }}
            </button>
          </div>
        </form>
      </aside>

      <main class="list-panel">
        <div class="list-header">
          <div class="search-wrapper">
            <LucideSearch />
            <input
              type="search"
              v-model="searchTerm"
              placeholder="Pesquisar por nome, código, CPF..."
            />
          </div>
          <button
            @click="handleDeleteSelected"
            class="btn btn-danger"
            :disabled="selectedClients.length === 0"
          >
            <LucideTrash />
            Excluir ({{ selectedClients.length }})
          </button>
        </div>
        <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <ClientesTable
          :clientes="filteredClients"
          v-model:selectedClients="selectedClients"
          :isAllSelected="isAllSelected"
          @toggle-select-all="toggleSelectAll"
          @edit="startEdit"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useTheme } from "../composables/useTheme";
import {
  LucideUserPlus,
  LucideSave,
  LucideTrash,
  LucideSearch,
  LucidePencil,
} from "lucide-vue-next";
import ClientesTable from "./ClientesTable.vue";

// --- Estado Reativo e Constantes ---
const { isDarkMode } = useTheme();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AUTH_TOKEN = localStorage.getItem("authToken");

const clients = ref([]);
const isLoading = ref(true);
const isCepLoading = ref(false);
const searchTerm = ref("");
const selectedClients = ref([]);
const isEditingId = ref(null);

const form = reactive({
  codigoCliente: "",
  nome: "",
  telefone: "",
  cpfCnpj: "",
  tipoDocumento: "CPF",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
});

// --- Lógica do Formulário e CEP ---
const resetForm = () => {
  isEditingId.value = null;
  Object.assign(form, {
    codigoCliente: "",
    nome: "",
    telefone: "",
    cpfCnpj: "",
    tipoDocumento: "CPF",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  });
};

const fetchAddressByCep = async () => {
  if (!form.cep) return;
  isCepLoading.value = true;

  try {
    const response = await axios.get(
      `https://viacep.com.br/ws/${form.cep.replace(/\D/g, "")}/json/`
    );
    if (response.data.erro) {
      alert("CEP não encontrado.");
    } else {
      form.rua = response.data.logradouro;
      form.bairro = response.data.bairro;
      form.cidade = response.data.localidade;
      form.estado = response.data.uf;
      form.pais = "Brasil";
    }
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    alert("Não foi possível buscar o endereço pelo CEP.");
  } finally {
    isCepLoading.value = false;
  }
};

// --- Lógica de CRUD ---
const fetchClients = async () => {
  isLoading.value = true;
  if (!AUTH_TOKEN) {
    router.push("/login");
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    clients.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  } finally {
    isLoading.value = false;
  }
};

const startEdit = (client) => {
  isEditingId.value = client.id;
  Object.assign(form, client); // Copia todos os dados do cliente para o formulário
};

const cancelEdit = () => resetForm();

const handleSubmit = async () => {
  const payload = { ...form };
  try {
    if (isEditingId.value) {
      await axios.put(`${API_URL}/customers/${isEditingId.value}`, payload, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      alert("Cliente atualizado com sucesso!");
    } else {
      await axios.post(`${API_URL}/customers`, payload, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      alert("Cliente cadastrado com sucesso!");
    }
    resetForm();
    await fetchClients();
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    alert("Ocorreu um erro ao salvar o cliente.");
  }
};

const handleDeleteSelected = async () => {
  if (
    !confirm(`Tem certeza que deseja excluir ${selectedClients.value.length} cliente(s)?`)
  )
    return;
  const promises = selectedClients.value.map((id) =>
    axios.delete(`${API_URL}/customers/${id}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    })
  );
  try {
    await Promise.all(promises);
    alert("Cliente(s) excluído(s) com sucesso!");
    selectedClients.value = [];
    await fetchClients();
  } catch (error) {
    console.error("Erro ao excluir clientes:", error);
    alert("Ocorreu um erro ao excluir os clientes.");
  }
};

// --- Propriedades Computadas ---
const filteredClients = computed(() => {
  if (!searchTerm.value) return clients.value;
  const term = searchTerm.value.toLowerCase();
  return clients.value.filter((c) =>
    Object.values(c).some((value) => String(value).toLowerCase().includes(term))
  );
});

const isAllSelected = computed({
  get: () =>
    filteredClients.value.length > 0 &&
    selectedClients.value.length === filteredClients.value.length,
  set: (value) => {
    selectedClients.value = value ? filteredClients.value.map((c) => c.id) : [];
  },
});

const toggleSelectAll = (event) => {
  isAllSelected.value = event.target.checked;
};

onMounted(fetchClients);
</script>

<style>
/* Variáveis de Tema */
:root {
  --font-family: "Poppins", sans-serif;
  --bg-page: #f0f2f5;
  --bg-panel: #ffffff;
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e9ecef; /* Borda um pouco mais suave */
  --accent-color: #3a8ee6;
  --accent-hover: #2a6fd1;
  --danger-color: #dc3545;
  --danger-hover: #c82333;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --input-bg: #fff;
  --glass-bg: rgba(255, 255, 255, 0.8); /* Glasmorfismo mais claro */
  --glass-blur: 5px; /* Desfoque mais sutil */
}

.dark-mode {
  --bg-page: #121212;
  --bg-panel: #1e1e1e;
  --text-primary: #e0e0e0;
  --text-secondary: #aaa;
  --border-color: #333;
  --input-bg: #2a2a2a;
  --glass-bg: rgba(30, 30, 30, 0.75);
}

/* Estrutura Principal (sem alterações) */
.page-container,
.page-header,
.main-layout,
.form-panel,
.panel-title,
.client-form,
.client-form fieldset,
.client-form legend,
.form-grid,
.form-group,
.col-span-2,
.col-span-3,
.col-span-4,
.col-span-6,
.form-group label,
.form-group input,
.form-group select,
.cep-wrapper,
.spinner-cep,
.form-actions,
.list-panel,
.list-header,
.search-wrapper,
.btn,
.btn-primary,
.btn-secondary,
.btn-danger,
.action-icon,
.loading-overlay,
.spinner,
@keyframes spin,
@media (max-width: 1200px) {
  /* Mantém todos os estilos anteriores que não são da tabela */
}
/* Colando estilos repetidos para garantir que funcione sem @import */
.page-container {
  font-family: var(--font-family);
  background-color: var(--color-background-base);
  color: var(--text-primary);
  padding: 2rem;
  min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}
.page-header svg {
  width: 32px;
  height: 32px;
  color: var(--accent-color);
}
.main-layout {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 2rem;
  align-items: flex-start;
}
.form-panel {
  background-color: var(--color-background-component);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  position: sticky;
  top: 2rem;
}
.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}
.client-form fieldset {
  border: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}
.client-form legend {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 1rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.col-span-2 {
  grid-column: span 2;
}
.col-span-3 {
  grid-column: span 3;
}
.col-span-4 {
  grid-column: span 4;
}
.col-span-6 {
  grid-column: span 6;
}
.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.form-group input,
.form-group select {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(58, 142, 230, 0.2);
}
.cep-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.spinner-cep {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}
.list-panel {
  background-color: var(--color-background-component);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}
.search-wrapper input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-size: 1rem;
}
.search-wrapper svg {
  color: var(--text-secondary);
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background-color: var(--accent-color);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--accent-hover);
}
.btn-secondary {
  background-color: #6c757d;
  color: #fff;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}
.btn-danger {
  background-color: var(--danger-color);
  color: #fff;
}
.btn-danger:hover:not(:disabled) {
  background-color: var(--danger-hover);
}
.action-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}
.action-icon:hover {
  color: var(--accent-color);
}
.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .loading-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== ESTILOS DA TABELA MELHORADOS ===== */

.table-container {
  max-height: 70vh;
  overflow: auto; /* Garante rolagem vertical e horizontal */
  position: relative;
}

table {
  width: 100%;
  border-collapse: separate; /* Mude para separate para usar border-spacing */
  border-spacing: 0;
  min-width: 900px; /* Largura mínima para forçar rolagem horizontal */
}

th,
td {
  padding: 1rem 1.25rem; /* Mais padding para mais "respiro" */
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle; /* Alinha o conteúdo verticalmente ao centro */
  white-space: nowrap; /* Impede que o texto quebre para a próxima linha */
}

th {
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

tbody tr:hover {
  background-color: rgba(58, 142, 230, 0.1);
}

.dark-mode tbody tr:hover {
  background-color: rgba(58, 142, 230, 0.2);
}

/* Definição da Largura das Colunas */
.col-select {
  width: 5%;
  text-align: center;
}
.col-codigo {
  width: 10%;
}
.col-nome {
  padding: 1rem;
  width: 40%; /* Mais espaço para o nome */
  white-space: normal; /* Permite que apenas o nome quebre a linha se necessário */
}
.col-telefone {
  width: 15%;
}
.col-cpfcnpj {
  width: 20%;
}
.col-actions {
  width: 10%;
  padding: 1rem;
  text-align: center;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Responsividade */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .form-panel {
    position: static;
  }
}
</style>
