<!-- src/components/DetalhesOrdem.vue -->
<template>
  <BaseCard class="details-card">
    <!-- Cabeçalho do Card -->
    <header class="details-card__header">
      <div class="details-card__title-wrapper">
        <LucideClipboardList class="details-card__icon" />
        <h2 class="details-card__title">
          Detalhes da Ordem #{{ initialOrder?.numeroOrdem }}
        </h2>
      </div>
      <div v-if="status" class="status-badge" :class="status.class">
        {{ status.text }}
      </div>
    </header>

    <!-- Corpo do Card -->
    <div class="details-card__body">
      <div class="details-grid">
        <!-- Coluna 1 -->
        <div class="details-grid__column">
          <InfoBlock label="Cliente" :is-editing="isEditing">
            <template #view>{{ initialOrder?.cliente }}</template>
            <template #edit>
              <!-- Usando o componente de Autocomplete corrigido -->
              <AutocompleteClient v-model="editState.cliente" @clienteSelecionado="handleClienteSelecionado" />
            </template>
          </InfoBlock>
          <InfoBlock label="Telefone" :is-editing="isEditing">
            <template #view>{{ initialOrder?.telefone }}</template>
            <template #edit>
              <BaseInput v-model="editState.telefone" placeholder="Telefone do cliente" />
            </template>
          </InfoBlock>
          <InfoBlock label="Solicitante" :is-editing="isEditing">
            <template #view>{{ initialOrder?.solicitante }}</template>
            <template #edit>
              <BaseInput v-model="editState.solicitante" placeholder="Nome do solicitante" />
            </template>
          </InfoBlock>
          <InfoBlock label="Departamento" :is-editing="isEditing">
            <template #view>{{ initialOrder?.departamento }}</template>
            <template #edit>
              <BaseInput v-model="editState.departamento" placeholder="Departamento" />
            </template>
          </InfoBlock>
        </div>

        <!-- Coluna 2 -->
        <div class="details-grid__column">
          <InfoBlock label="Quantidade" :is-editing="isEditing">
            <template #view>{{ initialOrder?.quantidade }}</template>
            <template #edit>
              <BaseInput v-model.number="editState.quantidade" type="number" min="1" />
            </template>
          </InfoBlock>
          <InfoBlock label="Material" :is-editing="isEditing">
            <template #view>{{ initialOrder?.material }}</template>
            <template #edit>
              <BaseInput v-model="editState.material" placeholder="Tipo de material" />
            </template>
          </InfoBlock>
          <InfoBlock label="Prazo de Entrega" :is-editing="isEditing">
            <template #view>{{ formatDate(initialOrder?.prazoEntrega) }}</template>
            <template #edit>
              <BaseInput v-model="editState.prazoEntrega" type="date" />
            </template>
          </InfoBlock>
          <InfoBlock v-if="priority" label="Prioridade">
            <template #view>
              <span class="priority-badge" :class="priority.class">{{ priority.text }}</span>
            </template>
          </InfoBlock>
        </div>

        <!-- Linhas Completas -->
        <div class="details-grid__full-row">
          <InfoBlock label="Descrição" :is-editing="isEditing">
            <template #view>
              <p class="description-text">{{ initialOrder?.descricao }}</p>
            </template>
            <template #edit>
              <!-- Usando um textarea, que será estilizado pelo BaseInput se for uma prop futura -->
              <textarea v-model="editState.descricao" class="ru-textarea" rows="4"></textarea>
            </template>
          </InfoBlock>
        </div>
        <div class="details-grid__full-row">
          <InfoBlock label="Observação" :is-editing="isEditing">
            <template #view>
              <p class="description-text">{{ initialOrder?.observacao || 'Nenhuma' }}</p>
            </template>
            <template #edit>
              <textarea v-model="editState.observacao" class="ru-textarea" rows="3"></textarea>
            </template>
          </InfoBlock>
        </div>
      </div>
    </div>

    <!-- Rodapé do Card -->
    <footer v-if="isEditable && authState.isAdmin" class="details-card__footer">
      <template v-if="!isEditing">
        <!-- Botões baseados no nosso sistema de design -->
        <BaseButton variant="update" @click="toggleEdit(true)">
          <LucidePencil /> Editar
        </BaseButton>
        <BaseButton variant="delete" @click="$emit('ordem-arquivada')">
          <LucideArchive /> Arquivar
        </BaseButton>
      </template>
      <template v-else>
        <!-- Adicionar uma variante 'secondary' ou 'outline' ao BaseButton seria ideal aqui -->
        <BaseButton variant="secondary" @click="toggleEdit(false)">Cancelar</BaseButton>
        <BaseButton variant="create" @click="saveDetails">
          <LucideSave /> Salvar
        </BaseButton>
      </template>
    </footer>
  </BaseCard>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import axios from 'axios';
import moment from 'moment-timezone';
import { LucideClipboardList, LucidePencil, LucideSave, LucideArchive } from 'lucide-vue-next';

// Importando todos os nossos componentes base
import BaseCard from './Base/BaseCard.vue';
import BaseButton from './Base/BaseButton.vue';
import BaseInput from './Base/BaseInput.vue';
import InfoBlock from './Base/InfoBlock.vue';
import AutocompleteClient from './AutocompleteClient.vue';

const props = defineProps({
  ordem: { type: Object, default: () => ({}) },
  authState: { type: Object, required: true },
});
const emit = defineEmits(['update:ordem', 'ordem-arquivada']);

// A lógica interna permanece muito similar
const initialOrder = ref(props.ordem);
const isEditing = ref(false);
const editState = reactive({});
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- Funções de Edição ---
const toggleEdit = (editing) => {
  if (editing && initialOrder.value) {
    Object.assign(editState, {
      ...initialOrder.value,
      prazoEntrega: initialOrder.value.prazoEntrega ? moment(initialOrder.value.prazoEntrega).format('YYYY-MM-DD') : ''
    });
  }
  isEditing.value = editing;
};

const saveDetails = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const url = `${API_URL}/orders/${initialOrder.value.id}/update-details`;
    const response = await axios.put(url, editState, { headers: { Authorization: `Bearer ${token}` } });
    emit("update:ordem", response.data);
    toggleEdit(false);
    // TODO: Substituir 'alert' por um sistema de notificação (componente Alert.vue)
    alert("Detalhes atualizados com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar os detalhes:", err);
    alert("Erro ao atualizar os detalhes da ordem.");
  }
};

// --- Lógica do Autocomplete ---
// Esta função é chamada quando o evento @clienteSelecionado é emitido pelo AutocompleteClient
const handleClienteSelecionado = (cliente) => {
  editState.cliente_id = cliente.id;
  editState.cliente = cliente.nome; // Garante que o nome seja atualizado
  // Preenche outros campos, se necessário
  if (cliente.telefone_principal) {
    editState.telefone = cliente.telefone_principal;
  }
}

// --- Propriedades Computadas ---
const isEditable = computed(() => initialOrder.value && !initialOrder.value.finalizada && !initialOrder.value.archived);

const status = computed(() => {
  if (!initialOrder.value) return null;
  if (initialOrder.value.archived) return { text: 'Arquivada', class: 'status--archived' };
  if (initialOrder.value.finalizada) return { text: 'Finalizada', class: 'status--finalized' };
  return { text: 'Pendente', class: 'status--pending' };
});

const priority = computed(() => {
  if (!initialOrder.value?.prazoEntrega) return { text: 'Normal', class: 'priority--low' };
  const hoje = moment().tz("America/Sao_Paulo");
  const prazo = moment.tz(initialOrder.value.prazoEntrega, "YYYY-MM-DD", "America/Sao_Paulo").endOf("day");
  const diasRestantes = prazo.diff(hoje, "days");

  if (diasRestantes <= 1) return { text: "Urgente", class: 'priority--urgent' };
  if (diasRestantes <= 3) return { text: "Alta", class: 'priority--high' };
  if (diasRestantes <= 7) return { text: "Média", class: 'priority--medium' };
  return { text: "Baixa", class: 'priority--low' };
});

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return moment.tz(dateString, "America/Sao_Paulo").format("DD/MM/YYYY");
};

// --- Watcher ---
watch(() => props.ordem, (newOrder) => {
  initialOrder.value = newOrder;
  if (isEditing.value) {
    toggleEdit(false);
  }
}, { deep: true });
</script>

<style scoped>
/* Removemos o padding do card para controlar melhor o espaçamento interno */
:deep(.base-card) {
  padding: 0;
}

/* --- Cabeçalho --- */
.details-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-md);
}

.details-card__title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.details-card__icon {
  color: var(--color-button-update);
}

.details-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

/* --- Corpo e Grid --- */
.details-card__body {
  padding: var(--space-lg);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg) var(--space-xl);
}

.details-grid__column {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.details-grid__full-row {
  grid-column: 1 / -1;
}

.description-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

/* --- Badges de Status e Prioridade --- */
.status-badge,
.priority-badge {
  padding: var(--space-xs) var(--space-md);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

/* Mapeando para as cores globais de prioridade */
.priority--urgent {
  background-color: var(--color-priority-urgent);
  color: #fff;
}

.priority--high {
  background-color: var(--color-priority-high);
  color: #fff;
}

.priority--medium {
  background-color: var(--color-priority-medium);
  color: var(--color-text-primary);
}

.priority--low {
  background-color: var(--color-priority-low);
  color: #fff;
}

.status--pending {
  background-color: var(--color-button-update);
  color: #fff;
}

.status--finalized {
  background-color: var(--color-priority-low);
  color: #fff;
}

.status--archived {
  background-color: var(--color-background-base);
  color: var(--color-text-secondary);
}

/* --- Textarea Customizado (pode virar um BaseTextarea) --- */
.ru-textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-background-base);
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
  box-shadow: 0 0 0 3px rgba(75, 115, 159, 0.2);
}

/* --- Rodapé e Botões --- */
.details-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background-base);
}

/* --- Responsividade --- */
@media (max-width: 768px) {
  .details-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .details-card__footer {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .details-card__footer>.base-button {
    width: 100%;
  }
}
</style>
