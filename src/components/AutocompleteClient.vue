<!-- src/components/AutocompleteClient.vue -->
<template>
  <div class="autocomplete-wrapper">
    <!-- Usamos v-model diretamente, pois a lógica agora está no <script> -->
    <BaseInput
      label="Cliente"
      v-model="searchTerm"
      @blur="onBlur"
      placeholder="Digite para buscar um cliente..."
      autocomplete="off"
    />
    <ul v-if="showSuggestions && sugestoes.length > 0" class="sugestoes-list">
      <li v-for="sugestao in sugestoes" :key="sugestao.id" @mousedown="selecionarCliente(sugestao)">
        {{ sugestao.nome }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import BaseInput from './Base/BaseInput.vue';

// --- Props e Emits para v-model ---
const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(['update:modelValue', 'clienteSelecionado']);

// --- Estado Interno ---
const searchTerm = ref(props.modelValue);
const todosClientes = ref([]);
const sugestoes = ref([]);
const showSuggestions = ref(false);

// --- Lógica Principal com 'watch' (A Correção) ---

// Observa o v-model que vem do componente pai (props.modelValue)
// e atualiza o valor interno (searchTerm) se ele mudar externamente.
watch(() => props.modelValue, (newValue) => {
  searchTerm.value = newValue;
});

// Observa a variável interna 'searchTerm'. Esta é a forma correta
// de reagir à digitação do usuário dentro deste componente.
watch(searchTerm, (newValue) => {
  // 1. Comunica a mudança de volta para o componente pai.
  emit('update:modelValue', newValue);

  // 2. Executa a lógica de filtro.
  if (!newValue || newValue.length < 1) {
    sugestoes.value = [];
    showSuggestions.value = false;
    return;
  }
  
  sugestoes.value = todosClientes.value.filter((cliente) =>
    cliente.nome.toLowerCase().includes(newValue.toLowerCase())
  );
  showSuggestions.value = true;
});

// Ao selecionar um cliente da lista
const selecionarCliente = (cliente) => {
  searchTerm.value = cliente.nome; // Atualiza o campo de texto
  emit('clienteSelecionado', cliente); // Envia o objeto completo para o pai
  showSuggestions.value = false; // Esconde a lista
};

// Ao perder o foco, esconde a lista
const onBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200); // Delay para permitir o clique na sugestão
};

// --- Carregamento dos Dados ---
onMounted(async () => {
  try {
    const token = localStorage.getItem("authToken");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao buscar clientes');
    todosClientes.value = await response.json();
  } catch (err) {
    console.error("Erro ao carregar clientes no Autocomplete:", err);
  }
});
</script>

<style scoped>
.autocomplete-wrapper {
  position: relative;
  width: 100%;
}
.sugestoes-list {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  width: 100%;
  background-color: var(--color-background-component);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-card);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: var(--space-sm);
  margin-top: var(--space-xs);
}
.sugestoes-list li {
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
}
.sugestoes-list li:hover {
  background-color: var(--color-button-update);
  color: white;
}
</style>
