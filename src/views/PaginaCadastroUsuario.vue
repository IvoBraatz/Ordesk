<!-- src/views/PaginaCadastroUsuario.vue -->
<template>
  <!-- 1. O container da página agora é um flex container que ocupa todo o espaço -->
  <div class="user-management-page">
    <header class="page-header">
      <LucideUsers class="page-header__icon" />
      <h1 class="page-header__title">Gestão de Usuários</h1>
    </header>

    <!-- 2. Este container flex agora funciona corretamente -->
    <div class="crud-layout-container">
      <!-- PAINEL LATERAL COM FORMULÁRIOS -->
      <aside class="side-panel">
        <BaseCard class="form-wrapper">
          <h2 class="form-wrapper__title">
            <LucideUserPlus /> Cadastrar Novo Usuário
          </h2>
          <form id="register-form" @submit.prevent="register" class="form">
            <BaseInput label="Usuário" v-model="registerForm.username" placeholder="Nome de usuário" required />
            <BaseInput label="Senha" v-model="registerForm.password" type="password" placeholder="Mínimo 6 caracteres"
              required />
            <BaseInput label="Confirme a Senha" v-model="registerForm.confirmPassword" type="password"
              placeholder="Repita a senha" required />
            <BaseButton variant="create" type="submit" class="btn--full">
              <LucidePlusCircle /> Cadastrar
            </BaseButton>
            <Alert v-if="registerAlert.message" :type="registerAlert.type" class="form__alert">{{ registerAlert.message
              }}</Alert>
          </form>
        </BaseCard>

        <BaseCard v-if="isLoggedIn" class="form-wrapper">
          <h2 class="form-wrapper__title">
            <LucideKey /> Alterar Minha Senha
          </h2>
          <p class="form__user-info">
            Alterando a senha para: <strong>{{ currentUser.username }}</strong>
          </p>
          <form id="update-password-form" @submit.prevent="updatePassword" class="form">
            <BaseInput label="Nova Senha" v-model="passwordForm.newPassword" type="password" required />
            <BaseInput label="Confirme a Nova Senha" v-model="passwordForm.confirmNewPassword" type="password"
              required />
            <BaseButton variant="update" type="submit" class="btn--full">
              <LucideSave /> Atualizar Senha
            </BaseButton>
            <Alert v-if="passwordAlert.message" :type="passwordAlert.type" class="form__alert">{{ passwordAlert.message
              }}</Alert>
          </form>
        </BaseCard>
      </aside>

      <!-- PAINEL PRINCIPAL COM A LISTA DE USUÁRIOS -->
      <!-- 3. O painel principal também é um flex container para organizar o header e a tabela -->
      <main class="main-panel">
        <BaseCard class="main-panel-card">
          <div class="panel-header">
            <div class="search-box">
              <LucideSearch class="search-box__icon" />
              <input type="search" v-model="searchTerm" placeholder="Pesquisar usuários por ID ou nome..."
                class="search-box__input" />
            </div>
          </div>
          <!-- 4. O container da tabela agora tem sua própria rolagem se necessário -->
          <div class="table-container">
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner"></div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col--id">ID</th>
                  <th>Usuário</th>
                  <th class="col--actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="3" class="data-table__cell--empty">Nenhum usuário encontrado.</td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id" class="data-table__row">
                  <td class="col--id">{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td class="col--actions">
                    <button @click="handleDeleteUser(user.id)" class="btn-icon btn-icon--danger" title="Excluir Usuário"
                      :disabled="currentUser.id === user.id">
                      <LucideTrash />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </main>
    </div>
  </div>
</template>

<script setup>
// O SCRIPT SETUP CONTINUA O MESMO, SEM ALTERAÇÕES
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { authState } from '../stores/authState';
import BaseInput from '../components/Base/BaseInput.vue';
import BaseButton from '../components/Base/BaseButton.vue';
import BaseCard from '../components/Base/BaseCard.vue';
import Alert from '../components/Alert.vue';
import { LucideUserPlus, LucidePlusCircle, LucideKey, LucideSearch, LucideUsers, LucideSave, LucideTrash } from 'lucide-vue-next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const registerForm = reactive({ username: '', password: '', confirmPassword: '' });
const passwordForm = reactive({ newPassword: '', confirmNewPassword: '' });
const users = ref([]);
const isLoading = ref(true);
const searchTerm = ref('');
const registerAlert = reactive({ message: '', type: 'info' });
const passwordAlert = reactive({ message: '', type: 'info' });
const currentUser = computed(() => authState.currentUser);
const isLoggedIn = computed(() => authState.isAuthenticated && authState.currentUser);

const setAlert = (alertRef, type, message, duration = 5000) => {
  alertRef.type = type;
  alertRef.message = message;
  setTimeout(() => { alertRef.message = ''; }, duration);
};

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
    users.value = response.data;
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    setAlert(registerAlert, 'error', 'Falha ao carregar a lista de usuários.');
  } finally {
    isLoading.value = false;
  }
};

const register = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    return setAlert(registerAlert, 'error', 'As senhas não coincidem.');
  }
  if (registerForm.password.length < 6) {
    return setAlert(registerAlert, 'error', 'A senha deve ter no mínimo 6 caracteres.');
  }
  try {
    const token = localStorage.getItem("authToken");
    await axios.post(`${API_URL}/auth/register`, { username: registerForm.username, password: registerForm.password }, { headers: { Authorization: `Bearer ${token}` } });
    setAlert(registerAlert, 'success', `Usuário "${registerForm.username}" cadastrado!`);
    Object.assign(registerForm, { username: '', password: '', confirmPassword: '' });
    await fetchUsers();
  } catch (err) {
    setAlert(registerAlert, 'error', err.response?.data?.message || 'Erro ao cadastrar usuário.');
  }
};

const updatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    return setAlert(passwordAlert, 'error', 'As novas senhas não coincidem.');
  }
  if (passwordForm.newPassword.length < 6) {
    return setAlert(passwordAlert, 'error', 'A nova senha deve ter no mínimo 6 caracteres.');
  }
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${API_URL}/auth/update-password`, { newPassword: passwordForm.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
    setAlert(passwordAlert, 'success', response.data.message || 'Senha atualizada com sucesso!');
    Object.assign(passwordForm, { newPassword: '', confirmNewPassword: '' });
  } catch (err) {
    setAlert(passwordAlert, 'error', err.response?.data?.message || 'Erro ao atualizar a senha.');
  }
};

const handleDeleteUser = async (userId) => {
  if (currentUser.value?.id === userId) {
    setAlert(registerAlert, 'error', 'Você não pode excluir seu próprio usuário.');
    return;
  }
  if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
  try {
    const token = localStorage.getItem("authToken");
    await axios.delete(`${API_URL}/auth/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
    setAlert(registerAlert, 'success', 'Usuário excluído com sucesso!');
    await fetchUsers();
  } catch (err) {
    setAlert(registerAlert, 'error', 'Não foi possível excluir o usuário.');
  }
};

const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value;
  const term = searchTerm.value.toLowerCase();
  return users.value.filter(user => String(user.id).includes(term) || user.username.toLowerCase().includes(term));
});

onMounted(fetchUsers);
</script>

<style scoped>
/* --- MUDANÇAS PRINCIPAIS NO CSS AQUI --- */

.user-management-page {
  display: flex;
  /* Torna-se um flex container */
  flex-direction: column;
  /* Organiza header e container-crud verticalmente */
  /* Ocupa toda a altura do pai (.main-content) */
  padding: var(--space-lg);
  /* O padding que estava no main-content vem para cá */
  gap: var(--space-lg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
  /* Impede que o header encolha */
}

.page-header__icon {
  width: 32px;
  height: 32px;
  color: var(--color-button-update);
}

.page-header__title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.crud-layout-container {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
  flex-grow: 1;
  /* Permite que este container ocupe o espaço vertical restante */
  overflow: hidden;
  /* Controla o estouro de layout dos filhos */
}

.side-panel {
  flex: 0 0 400px;
  /* Base fixa de 400px, não cresce nem encolhe */
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  align-self: flex-start;
  /* Garante que ele não estique verticalmente */
}

.main-panel {
  flex: 1;
  /* Ocupa todo o espaço restante */
  display: flex;
  /* Também é flex para organizar seus filhos */
  flex-direction: column;
  min-width: 0;
}

.main-panel-card {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0;
  overflow: hidden;
}

.panel-header {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.table-container {
  overflow-y: auto;
  /* A rolagem agora é SÓ no container da tabela */
  flex-grow: 1;
  /* Faz este container ocupar o espaço disponível dentro do card */
}

/* --- ESTILOS DOS COMPONENTES INTERNOS (SEM MUDANÇAS SIGNIFICATIVAS) --- */
.form-wrapper__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-md) 0;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.form-wrapper__title svg {
  width: 24px;
  height: 24px;
  color: var(--color-button-update);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form__user-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: calc(-1 * var(--space-sm)) 0 var(--space-md) 0;
  padding: var(--space-sm);
  background-color: var(--color-background-base);
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.form__alert {
  margin-top: var(--space-sm);
}

.search-box {
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

.search-box__input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  width: 100%;
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
}

.data-table th {
  background-color: var(--color-background-component);
  position: sticky;
  top: 0;
  z-index: 1;
}

.col--id {
  width: 15%;
}

.col--actions {
  width: 15%;
  text-align: right;
}

.data-table__cell--empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.btn--full {
  width: 100%;
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

.btn-icon--danger:hover {
  color: var(--color-button-delete);
  background-color: color-mix(in srgb, var(--color-button-delete) 15%, transparent);
}

.btn-icon:disabled {
  color: var(--color-border);
  cursor: not-allowed;
  background-color: transparent;
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
</style>
