<!-- src/views/PaginaLogin.vue -->
<template>
  <div class="login-wrapper">
    <div class="login-card" role="main">
      <header class="login-header">
        <h1 class="login-title">PATERNOLLI</h1>
        <p class="login-subtitle">Acesse sua conta para continuar</p>
      </header>

      <form @submit.prevent="login" class="login-form">
        <!-- Usando o BaseInput -->
        <BaseInput label="Usuário" v-model.trim="username" placeholder="Digite seu usuário" :error="errors.username"
          @input="clearError('username')" />

        <!-- O BaseInput para senha, com o botão de visibilidade ao lado -->
        <div class="password-input-group">
          <BaseInput label="Senha" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Sua senha"
            :error="errors.password" @input="clearError('password')" />
          <button type="button" class="toggle-password" @click="togglePassword"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
            <LucideEyeOff v-if="showPassword" class="icon" />
            <LucideEye v-else class="icon" />
          </button>
        </div>

        <div class="form-options">
          <a href="#" class="forgot-password-link">Esqueceu a senha?</a>
        </div>

        <!-- Usando o BaseButton -->
        <BaseButton type="submit" variant="create" class="btn-submit" :disabled="loading || !canSubmit">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>Entrar</span>
        </BaseButton>

        <p v-if="errorMessage" role="alert" class="form-error">{{ errorMessage }}</p>
      </form>

      <footer class="login-footer">
        <small>© {{ new Date().getFullYear() }} Paternolli. Todos os direitos reservados.</small>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import { setAuthenticated } from "../stores/authState";
import { useTheme } from "../composables/useTheme";
// Importando os componentes base e ícones
import BaseInput from '../components/Base/BaseInput.vue';
import BaseButton from '../components/Base/BaseButton.vue';
import { LucideEye, LucideEyeOff } from 'lucide-vue-next';

// A lógica do script foi mantida, com a adição do Vue Router
const { toggleTheme } = useTheme(); // Apenas para ter acesso, caso queira um botão de tema aqui
const router = useRouter();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const errors = ref({ username: null, password: null });

const canSubmit = computed(() => username.value.trim().length >= 3 && password.value.length > 0);

function clearError(field) {
  errors.value[field] = null;
  errorMessage.value = "";
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function login() {
  errorMessage.value = "";
  if (!canSubmit.value) {
    if (username.value.trim().length < 3) errors.value.username = "Usuário deve ter ao menos 3 caracteres";
    if (!password.value) errors.value.password = "Senha é obrigatória";
    return;
  }

  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await axios.post(`${apiUrl}/auth/login`, {
      username: username.value.trim(),
      password: password.value,
    });
    const token = response.data.token;
    localStorage.setItem("authToken", token);
    const validateResponse = await axios.post(`${apiUrl}/auth/validate`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAuthenticated(true, validateResponse.data.user_type === 1, validateResponse.data);
    router.push('/');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Usuário ou senha inválidos.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.login-wrapper {
  min-height: 100vh;
  background-color: var(--color-background-base);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
}

.login-card {
  background: var(--color-background-component);
  border-radius: var(--border-radius-md);
  padding: var(--space-xl);
  box-shadow: var(--shadow-card);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--color-border);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-button-update);
}

.login-subtitle {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.password-input-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: grid;
  place-items: center;
  padding: var(--space-sm);
  border-radius: 50%;
}

.toggle-password:hover {
  color: var(--color-text-primary);
}

.toggle-password .icon {
  width: 20px;
  height: 20px;
}

/* BaseInput já tem margin-bottom, então não precisamos de gap no form */
.login-form .ru-form-group {
  margin-bottom: 0;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-top: calc(-1 * var(--space-md));
  /* Puxa para mais perto */
}

.forgot-password-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
}

.forgot-password-link:hover {
  color: var(--color-button-update);
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: var(--space-md) 0;
  height: 50px;
}

.loading-spinner {
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-error {
  font-weight: 600;
  color: var(--color-button-delete);
  text-align: center;
}

.login-footer {
  margin-top: var(--space-xl);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
