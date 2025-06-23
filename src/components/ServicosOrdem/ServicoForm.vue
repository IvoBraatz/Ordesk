<!-- src/components/ServicosOrdem/ServicoForm.vue -->
<template>
  <div class="servicos-ordem__form">
    <h2 class="servicos-ordem__form-title">Adicionar Serviço</h2>
    <form @submit.prevent="handleSubmit" class="servicos-ordem__form-content">
      <div class="servicos-ordem__form-group">
        <label class="servicos-ordem__form-label">Selecione o Serviço:</label>
        <BaseSelect
          v-model="servicoSelecionadoId"
          :options="servicosOptions"
          required
        />
      </div>

      <!-- Material / Fornecedor -->
      <div class="servicos-ordem__form-group" v-if="isMaterial || isFornecedorTerceirizado">
        <label class="servicos-ordem__form-label">
          Digite o {{ isMaterial ? 'Material' : 'Fornecedor' }}:
        </label>
        <BaseInput
          type="text"
          v-model="materialInput"
          :placeholder="isMaterial ? 'Digite o material' : 'Digite o fornecedor'"
          required
        />
      </div>

      <!-- Observação (para serviços não "material") -->
      <div class="servicos-ordem__form-group" v-if="!isMaterial">
        <label v-if="!isUnitService" class="servicos-ordem__form-label">Observação (Opcional):</label>
        <BaseTextarea
          v-if="!isUnitService"
          v-model="observacaoServico"
          placeholder="Digite a observação"
        />
      </div>

      <!-- Valor do Serviço -->
      <div class="servicos-ordem__form-group" v-if="userCanSeeValues">
        <label class="servicos-ordem__form-label">Valor do Serviço:</label>
        <template v-if="isMaterial || isFornecedorTerceirizado">
          <BaseInput
            type="number"
            v-model.number="materialValorInput"
            placeholder="Digite o valor"
            step="0.01"
            min="0"
            required
          />
        </template>
        <template v-else>
          <p>{{ valorServico ? `R$ ${parseFloat(valorServico).toFixed(2).replace('.', ',')}` : 'R$ 0,00' }}</p>
        </template>
      </div>

      <!-- Usuário Responsável -->
      <div class="servicos-ordem__form-group">
        <label class="servicos-ordem__form-label">Usuário Responsável:</label>
        <BaseSelect
          v-model="usuarioResponsavelId"
          :options="usuariosOptions"
          required
        />
      </div>

      <!-- Quantidade/Tempo -->
      <div class="servicos-ordem__form-group">
        <label class="servicos-ordem__form-label">
          {{ isMaterial ? 'Quantidade:' : 'Tempo:' }}
        </label>
        <template v-if="isFornecedorTerceirizado">
          <BaseInput
            type="text"
            v-model="tempoServico"
            @blur="tempoServico = formatTimeInput(tempoServico)"
            placeholder="HH:MM"
            required
            pattern="^[0-9]{2}:[0-9]{2}$"
          />
        </template>
        <template v-else-if="isMaterial">
          <BaseInput
            type="number"
            v-model.number="quantidadeServico"
            placeholder="Digite a quantidade"
            min="1"
            required
          />
        </template>
        <template v-else>
          <BaseSelect
            v-model="tempoServico"
            :options="props.temposDisponiveisSelect.map(t => ({ label: t, value: t }))"
            required
          />
        </template>
      </div>

      <div class="servicos-ordem__form-actions">
        <BaseButton type="submit" variant="create">
          <LucidePlusCircle class="servicos-ordem__icon" /> Adicionar Serviço
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { LucidePlusCircle } from 'lucide-vue-next';
import BaseButton from '../Base/BaseButton.vue';
import BaseInput from '../Base/BaseInput.vue';
import BaseSelect from '../Base/BaseSelect.vue';
import BaseTextarea from '../Base/BaseTextarea.vue';
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
  servicos: {
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
  userCanSeeValues: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const servicoSelecionadoId = ref('');
const usuarioResponsavelId = ref('');
const tempoServico = ref('');
const quantidadeServico = ref('');
const materialInput = ref('');
const materialValorInput = ref('');
const observacaoServico = ref('');

const servicosOptions = computed(() => props.servicos.map(s => ({ label: s.descricao, value: s.id })));
const usuariosOptions = computed(() => props.usuarios.map(u => ({ label: u.username, value: u.username })));

const servicoSelecionado = computed(() => props.servicos.find(s => s.id == servicoSelecionadoId.value));
const usuarioResponsavel = computed(() => props.usuarios.find(u => u.username == usuarioResponsavelId.value));

const isMaterial = computed(() => servicoSelecionado.value && servicoSelecionado.value.descricao && servicoSelecionado.value.descricao.toLowerCase() === 'material');
const isFornecedorTerceirizado = computed(() => servicoSelecionado.value && servicoSelecionado.value.descricao && servicoSelecionado.value.descricao.toLowerCase() === 'fornecedor terceirizado');
const isUnitService = computed(() => isMaterial.value);

const valorServico = computed({
  get() {
    if (isMaterial.value || isFornecedorTerceirizado.value) {
      return materialValorInput.value;
    }
    return servicoSelecionado.value ? servicoSelecionado.value.valor : '';
  },
  set(val) {
    if (isMaterial.value || isFornecedorTerceirizado.value) {
      materialValorInput.value = val;
    }
  }
});

function resetForm() {
  servicoSelecionadoId.value = '';
  usuarioResponsavelId.value = '';
  tempoServico.value = '';
  quantidadeServico.value = '';
  materialInput.value = '';
  materialValorInput.value = '';
  observacaoServico.value = '';
}

function formatTimeInput(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function handleSubmit() {
  if (!servicoSelecionado.value) {
    alert('Selecione um serviço válido.');
    return;
  }
  if (!usuarioResponsavel.value) {
    alert('Selecione o usuário responsável.');
    return;
  }
  let descricaoServico = servicoSelecionado.value.descricao;
  let valor = isMaterial.value || isFornecedorTerceirizado.value ? parseFloat(materialValorInput.value) || 0 : servicoSelecionado.value.valor;
  let tempoOuQtd;
  if (isMaterial.value) {
    if (!materialInput.value.trim()) {
      alert('Digite o material.');
      return;
    }
    descricaoServico = `Material ${materialInput.value.trim()}`;
    tempoOuQtd = parseInt(quantidadeServico.value);
    if (!tempoOuQtd || tempoOuQtd < 1) {
      alert('Digite uma quantidade válida.');
      return;
    }
  } else if (isFornecedorTerceirizado.value) {
    if (!materialInput.value.trim()) {
      alert('Digite o fornecedor.');
      return;
    }
    descricaoServico = `Fornecedor Terceirizado ${materialInput.value.trim()}`;
    if (!tempoServico.value.match(/^\d{2}:\d{2}$/)) {
      alert('Digite o tempo no formato HH:MM.');
      return;
    }
    const [h, m] = tempoServico.value.split(':').map(Number);
    tempoOuQtd = h + m / 60;
  } else {
    // Serviço normal
    if (!tempoServico.value) {
      alert('Selecione o tempo.');
      return;
    }
    if (typeof tempoServico.value === 'string' && tempoServico.value.match(/^\d{2}:\d{2}$/)) {
      const [h, m] = tempoServico.value.split(':').map(Number);
      tempoOuQtd = h + m / 60;
    } else {
      tempoOuQtd = parseFloat(tempoServico.value);
    }
  }
  const payload = {
    servicoId: servicoSelecionado.value.id,
    descricao: descricaoServico,
    usuarioResponsavel: usuarioResponsavel.value.username,
    tempoServico: isMaterial.value ? tempoOuQtd : Number(tempoOuQtd.toFixed(3)),
    valor: valor,
    observacao: (isMaterial.value ? null : (observacaoServico.value || null))
  };
  console.log('DEBUG ServicoForm.vue - payload enviado:', payload);
  emit('submit', payload);
  resetForm();
}

onMounted(() => {
  // debug
  console.log('DEBUG ServicoForm.vue - props.servicos:', props.servicos);
  console.log('DEBUG ServicoForm.vue - props.usuarios:', props.usuarios);
  console.log('DEBUG ServicoForm.vue - props.temposDisponiveisSelect:', props.temposDisponiveisSelect);
});
</script>

<style>
@import './ServicosOrdem.styles.css';
</style> 