<!-- src/components/Base/BaseSelect.vue -->
<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    class="base-select"
    v-bind="$attrs"
  >
    <option disabled value="">Selecione...</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => []
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-base);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.base-select:hover {
  border-color: var(--color-border-hover);
}

.base-select:focus {
  outline: none;
  border-color: var(--color-button-update);
  box-shadow: 0 0 0 2px var(--color-button-update-light);
}

.base-select:disabled {
  background-color: var(--color-background-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Estilo para as opções */
.base-select option {
  background-color: var(--color-background-base);
  color: var(--color-text-primary);
  padding: var(--space-sm);
}

/* Estilo para o placeholder */
.base-select option[value=""] {
  color: var(--color-text-secondary);
}
</style> 