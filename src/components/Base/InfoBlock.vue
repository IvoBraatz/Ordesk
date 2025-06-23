<!-- src/components/Base/InfoBlock.vue -->
<template>
  <div class="info-block">
    <label class="info-block__label">{{ label }}</label>
    <div class="info-block__content">
      <slot v-if="!isEditing" name="view"></slot>
      <slot v-else name="edit"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
/* As variáveis agora vêm do design-system.css, não são mais definidas aqui! */

.info-block {
  width: 100%;
  margin-bottom: var(--space-md);
}

.info-block__label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary); /* <- Variável global */
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
}

.info-block__content {
  font-size: var(--font-size-md);
  color: var(--color-text-primary); /* <- Variável global */
  min-height: 24px;
  display: flex;
  align-items: center;
}
</style>