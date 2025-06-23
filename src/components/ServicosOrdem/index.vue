<!-- src/components/ServicosOrdem/index.vue -->
<template>
  <div class="servicos-ordem">
    <header class="servicos-ordem__header">
      <h2 class="servicos-ordem__title">
        <LucideWrench class="servicos-ordem__icon" />
        Serviços Adicionados
      </h2>
      <BaseButton v-if="userCanSeeValues" @click="toggleImposto" variant="update">
        {{ calcularComImposto ? "Exibir Sem Imposto" : "Exibir Com Imposto" }}
      </BaseButton>
    </header>

    <ServicosTable
      :servicos="servicosAdicionados"
      :servicos-ordenados="servicosOrdenados"
      :usuarios="usuarios"
      :tempos-disponiveis-select="temposDisponiveisSelect"
      :user-can-see-values="userCanSeeValues"
      :is-editable="isEditable"
      :calcular-com-imposto="calcularComImposto"
      @save="saveEditing"
      @cancel="cancelEditing"
      @edit="startEditing"
      @remove="removeService"
    />

    <!-- Total Geral -->
    <div v-if="servicosAdicionados.length > 0 && userCanSeeValues" class="servicos-ordem__total">
      <strong class="servicos-ordem__total-label">Total Geral:</strong>
      <span class="servicos-ordem__total-value">
        {{
          calcularComImposto
            ? formatarValor(calcularTotalGeralComImposto())
            : formatarValor(calcularTotalGeralSemImposto())
        }}
      </span>
    </div>

    <!-- Formulário para adicionar serviço -->
    <ServicoForm
      v-if="!ordem.finalizada && isEditable"
      :servicos="servicosOrdenados"
      :usuarios="usuarios"
      :tempos-disponiveis-select="temposDisponiveisSelect"
      :user-can-see-values="userCanSeeValues"
      @submit="adicionarServico"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { LucideWrench } from 'lucide-vue-next';
import BaseButton from '../Base/BaseButton.vue';
import ServicosTable from './ServicosTable.vue';
import ServicoForm from './ServicoForm.vue';
import axios from 'axios';

// Props
const props = defineProps({
  servicosAdicionados: {
    type: Array,
    default: () => []
  },
  servicosOrdenados: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  },
  temposDisponiveisSelect: {
    type: Array,
    default: () => []
  },
  authState: {
    type: Object,
    default: () => {}
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  ordem: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:servicosAdicionados']);

// Estado
const calcularComImposto = ref(false);

// Computed
const userCanSeeValues = computed(() => props.authState && props.authState.isAdmin);

// Métodos
const toggleImposto = () => {
  calcularComImposto.value = !calcularComImposto.value;
};

const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
};

const calcularTotalGeralComImposto = () => {
  return props.servicosAdicionados.reduce((total, servico) => {
    return total + (servico.valor * servico.tempo_servico * 1.1);
  }, 0);
};

const calcularTotalGeralSemImposto = () => {
  return props.servicosAdicionados.reduce((total, servico) => {
    return total + (servico.valor * servico.tempo_servico);
  }, 0);
};

// Métodos de edição
const startEditing = (servico) => {
  servico.isEditing = true;
  servico.editingServicoId = servico.servico_id;
  servico.editingUserId = servico.usuario_id;
  servico.editingTime = servico.tempo_servico;
  servico.editingQuantidade = servico.quantidade;
  servico.editingValor = servico.valor;
  servico.editingObservacao = servico.observacao;
  servico.editingMaterialInput = servico.material || '';
};

const saveEditing = (servico, index) => {
  // Lógica de salvamento
  servico.isEditing = false;
  emit('update:servicosAdicionados', [...props.servicosAdicionados]);
};

const cancelEditing = (servico) => {
  servico.isEditing = false;
};

const removeService = (servico, index) => {
  props.servicosAdicionados.splice(index, 1);
  emit('update:servicosAdicionados', [...props.servicosAdicionados]);
};

const adicionarServico = async (payload) => {
  try {
    const id = props.ordem.id;
    const token = localStorage.getItem('authToken');
    await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders/${id}/add-service`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Buscar lista atualizada
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders/${id}/services`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    emit('update:servicosAdicionados', response.data);
  } catch (err) {
    alert('Erro ao adicionar serviço: ' + (err.response?.data || err.message));
    console.error('Erro ao adicionar serviço:', err);
  }
};

onMounted(() => {
  console.log('DEBUG index.vue - props.servicosOrdenados:', props.servicosOrdenados);
  console.log('DEBUG index.vue - props.usuarios:', props.usuarios);
  console.log('DEBUG index.vue - props.temposDisponiveisSelect:', props.temposDisponiveisSelect);
});
</script>

<style scoped>
@import './ServicosOrdem.styles.css';
</style> 