<template>
  <div class="servicos-ordem__table-wrapper">
    <table class="servicos-ordem__table">
      <thead>
        <tr>
          <th>Centro de Custo</th>
          <th>Serviço</th>
          <th>Usuário</th>
          <th>Quantidade/Tempo</th>
          <th v-if="userCanSeeValues">Valor/Hora</th>
          <th v-if="userCanSeeValues">Valor Total</th>
          <th>Observação</th>
          <th class="servicos-ordem__cell--actions">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(servico, index) in servicos" :key="servico.id">
          <!-- Centro de Custo -->
          <td>
            <div v-if="servico.isEditing">
              {{ servico.editingServico ? servico.editingServico.centroDeCusto : '' }}
            </div>
            <div v-else>
              {{ servico.centroDeCusto }}
            </div>
          </td>

          <!-- Serviço -->
          <td>
            <div v-if="servico.isEditing">
              <div class="servicos-ordem__input-group">
                <BaseSelect
                  v-model="servico.editingServicoId"
                  :options="servicosOrdenados.map(s => ({ label: s.descricao, value: s.id }))"
                />
                <BaseInput
                  v-if="servico.editingServico &&
                    (servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'material' ||
                      servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'fornecedor terceirizado')"
                  type="text"
                  class="servicos-ordem__material-input"
                  :placeholder="servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'material' ? 'Digite o material' : 'Digite o fornecedor'"
                  required
                  v-model="servico.editingMaterialInput"
                />
              </div>
            </div>
            <div v-else>
              <template v-if="isCustomServiceDescription(servico.descricao)">
                <div>
                  <strong>{{ parseServiceDescription(servico.descricao).title }}</strong><br />
                  <span>{{ parseServiceDescription(servico.descricao).detail }}</span>
                </div>
              </template>
              <template v-else>
                {{ servico.descricao }}
              </template>
            </div>
          </td>

          <!-- Usuário -->
          <td>
            <div v-if="servico.isEditing">
              <BaseSelect
                v-model="servico.editingUserId"
                :options="usuariosOptions"
              />
            </div>
            <div v-else>
              {{ servico.usuario_responsavel }}
            </div>
          </td>

          <!-- Quantidade/Tempo -->
          <td>
            <div v-if="servico.isEditing">
              <template v-if="isFornecedorTerceirizado(servico.editingServico)">
                <BaseInput
                  type="text"
                  v-model="servico.editingTime"
                  @blur="servico.editingTime = formatTimeInput(servico.editingTime)"
                  placeholder="HH:MM"
                  required
                  pattern="^[0-9]{2}:[0-9]{2}$"
                />
              </template>
              <template v-else-if="isUnitService(servico.editingServico)">
                <BaseInput
                  type="number"
                  v-model.number="servico.editingQuantidade"
                  placeholder="Digite a quantidade"
                  min="1"
                  required
                />
              </template>
              <template v-else>
                <BaseSelect
                  v-model="servico.editingTime"
                  :options="temposDisponiveisSelect"
                />
              </template>
            </div>
            <div v-else>
              <template v-if="isUnitService({ descricao: servico.descricao })">
                {{ parseInt(servico.tempo_servico) }}
              </template>
              <template v-else>
                {{ userCanSeeValues ? formatarTempoDecimal(servico.tempo_servico) : decimalToHHMM(servico.tempo_servico) }}
              </template>
            </div>
          </td>

          <!-- Valor/Hora -->
          <td v-if="userCanSeeValues" class="servicos-ordem__cell--valor">
            <div v-if="servico.isEditing">
              <template v-if="servico.editingServico &&
                (servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'material' ||
                  servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'fornecedor terceirizado')">
                <BaseInput
                  type="number"
                  placeholder="Digite o valor"
                  step="0.01"
                  v-model.number="servico.editingValor"
                />
              </template>
              <template v-else>
                {{ formatarValor(servico.editingServico ? servico.editingServico.valor : servico.valor) }}
              </template>
            </div>
            <div v-else>
              {{ formatarValor(servico.valor) }}
            </div>
          </td>

          <!-- Valor Total -->
          <td v-if="userCanSeeValues" class="servicos-ordem__cell--valor">
            {{
              calcularComImposto
                ? formatarValor(calcularValorTotalComImposto(servico.valor, servico.tempo_servico))
                : formatarValor(calcularValorTotalSemImposto(servico.valor, servico.tempo_servico))
            }}
          </td>

          <!-- Observação -->
          <td>
            <div v-if="servico.isEditing">
              <BaseTextarea
                v-if="!(servico.editingServico && servico.editingServico.descricao && servico.editingServico.descricao.toLowerCase() === 'material')"
                v-model="servico.editingObservacao"
                placeholder="Observação"
              />
            </div>
            <div v-else>
              {{ servico.observacao }}
            </div>
          </td>

          <!-- Ações -->
          <td class="servicos-ordem__cell--actions">
            <div v-if="isEditable">
              <div v-if="servico.isEditing" class="servicos-ordem__actions">
                <BaseButton @click="$emit('save', servico, index)" variant="create">
                  <LucideSave class="servicos-ordem__icon" /> Salvar
                </BaseButton>
                <BaseButton @click="$emit('cancel', servico)" variant="delete">
                  <LucideX class="servicos-ordem__icon" /> Cancelar
                </BaseButton>
              </div>
              <div v-else class="servicos-ordem__actions">
                <BaseButton @click="$emit('edit', servico)" variant="update">
                  <LucideEdit class="servicos-ordem__icon" /> Editar
                </BaseButton>
                <BaseButton @click="$emit('remove', servico, index)" variant="delete">
                  <LucideX class="servicos-ordem__icon" /> Remover
                </BaseButton>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { LucideSave, LucideX, LucideEdit } from 'lucide-vue-next';
import BaseButton from '../Base/BaseButton.vue';
import BaseInput from '../Base/BaseInput.vue';
import BaseSelect from '../Base/BaseSelect.vue';
import BaseTextarea from '../Base/BaseTextarea.vue';
import { computed, onMounted } from 'vue';

const props = defineProps({
  servicos: {
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
  userCanSeeValues: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  calcularComImposto: {
    type: Boolean,
    default: false
  }
});

defineEmits(['save', 'cancel', 'edit', 'remove']);

const usuariosOptions = computed(() => props.usuarios.map(u => ({ label: u.username, value: u.username })));

// Funções auxiliares
const isCustomServiceDescription = (descricao) => {
  return descricao && (descricao.toLowerCase().includes('material') || descricao.toLowerCase().includes('fornecedor terceirizado'));
};

const parseServiceDescription = (descricao) => {
  const parts = descricao.split(' - ');
  return {
    title: parts[0],
    detail: parts[1] || ''
  };
};

const isFornecedorTerceirizado = (servico) => {
  return servico && servico.descricao && servico.descricao.toLowerCase() === 'fornecedor terceirizado';
};

const isUnitService = (servico) => {
  return servico && servico.descricao && servico.descricao.toLowerCase() === 'material';
};

const formatTimeInput = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const formatarTempoDecimal = (tempo) => {
  return parseFloat(tempo).toFixed(2);
};

const decimalToHHMM = (decimal) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
};

const calcularValorTotalComImposto = (valor, tempo) => {
  return valor * tempo * 1.1;
};

const calcularValorTotalSemImposto = (valor, tempo) => {
  return valor * tempo;
};

onMounted(() => {
  console.log('DEBUG ServicosTable.vue - props.servicos:', props.servicos);
});
</script>

<style scoped>
@import './ServicosOrdem.styles.css';
</style> 