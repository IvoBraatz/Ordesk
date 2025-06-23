<!-- src/components/Base/BaseButton.vue -->
<template>
  <!-- Mantivemos a sua estrutura, apenas ajustamos o @click para emitir o evento -->
  <button :class="['ru-button', variantClass]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    // As novas variantes do nosso sistema de design
    default: 'create', // create, update, delete
    validator: (value) => ['create', 'update', 'delete', 'secondary'].includes(value),
  }
});

defineEmits(['click']);

// Adaptando sua lógica 'computed' para as novas variantes
const variantClass = computed(() => {
  return `ru-button--${props.variant}`;
});
</script>

<style scoped>
/* Estilo base para 'ru-button', usando nossas variáveis globais */
.ru-button {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-base);
  color: #FFFFFF; /* A maioria dos botões terá texto branco */
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.ru-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Aplicando as cores do design system para cada variante */
.ru-button--create {
  background-color: var(--color-button-create);
}

.ru-button--update {
  background-color: var(--color-button-update);
}

.ru-button--delete {
  background-color: var(--color-button-delete);
}
</style>
