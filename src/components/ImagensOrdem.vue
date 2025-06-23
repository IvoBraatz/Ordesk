<!-- src/components/ImagensOrdem.vue -->
<template>
  <BaseCard class="details-card">
    <!-- Cabeçalho -->
    <header class="details-card__header">
        <div class="details-card__title-wrapper">
            <LucideImages class="details-card__icon"/>
            <h2 class="details-card__title">Imagens da Ordem</h2>
        </div>
    </header>
    
    <!-- Conteúdo com os cards de upload -->
    <div class="image-cards-container">
      <ImageUploadCard 
        title="Imagem Inicial"
        :image-url="initialImageUrl"
        :is-editable="isOrderEditable"
        @image-saved="saveInitialImage"
      />

      <ImageUploadCard
        title="Imagem do Serviço Finalizado"
        :image-url="finalImageUrl"
        :is-editable="isOrderEditable"
        @image-saved="saveFinalImage"
      />
    </div>

    <!-- Rodapé com ações -->
    <footer v-if="isOrderEditable" class="details-card__footer">
        <!-- Usando o nosso BaseButton com a variante 'create' -->
        <BaseButton 
          variant="create" 
          @click="finalizeOrder" 
          :disabled="!finalImageUrl"
          class="btn--full"
        >
          <LucideCheckCircle /> Finalizar Ordem
        </BaseButton>
    </footer>
    <!-- Banner para ordens não editáveis -->
    <div v-else class="finalized-banner">
        <p>Esta ordem já foi finalizada ou arquivada e não pode ser alterada.</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import axios from 'axios';
// Importando nossos componentes base
import BaseCard from './Base/BaseCard.vue';
import BaseButton from './Base/BaseButton.vue';
import ImageUploadCard from './ImageUploadCard.vue';
import { LucideImages, LucideCheckCircle } from 'lucide-vue-next';

// A lógica do script permanece a mesma, pois já era bem estruturada.
const props = defineProps({
  ordem: { type: Object, required: true },
});
const emit = defineEmits(['ordem-finalizada']);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const initialImageUrl = computed(() => props.ordem.imagens && props.ordem.imagens.length > 0 ? props.ordem.imagens[0] : null);
const finalImageUrl = computed(() => props.ordem.imagemServico);
const isOrderEditable = computed(() => !props.ordem.finalizada && !props.ordem.archived);

const saveImage = async (imageFile, fieldName, endpoint) => { 
  // Implementação da função de salvar imagem...
};
const saveInitialImage = (file) => saveImage(file, 'imagemInicial', 'update-initial-image');
const saveFinalImage = (file) => saveImage(file, 'image', 'edit-final');
const finalizeOrder = () => {
    if (!finalImageUrl.value) {
        // Idealmente, isso seria substituído por um componente de notificação
        console.warn("É necessário salvar uma imagem final antes de finalizar a ordem.");
        return;
    }
    emit('ordem-finalizada');
};
</script>

<style scoped>
/* As variáveis locais foram removidas. Agora usamos apenas as globais. */

/* Ajuste no padding do BaseCard para este componente específico */
:deep(.base-card) {
  padding: 0;
}

/* --- Cabeçalho --- */
.details-card__header {
  display: flex;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
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

/* --- Container dos Cards de Imagem --- */
.image-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
    padding: var(--space-lg);
}

/* --- Rodapé e Banner --- */
.details-card__footer {
    padding: var(--space-lg);
    border-top: 1px solid var(--color-border);
    background-color: var(--color-background-base);
}
.finalized-banner {
    padding: var(--space-lg);
    background-color: var(--color-background-base);
    text-align: center;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
}

/* --- Modificador para o Botão --- */
.btn--full {
  width: 100%;
}
</style>
