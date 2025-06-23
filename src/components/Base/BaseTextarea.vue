<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="base-textarea"
    v-bind="$attrs"
  ></textarea>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-textarea {
  min-height: 100px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-base);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.base-textarea:hover {
  border-color: var(--color-border-hover);
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-button-update);
  box-shadow: 0 0 0 2px var(--color-button-update-light);
}

.base-textarea:disabled {
  background-color: var(--color-background-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Placeholder */
.base-textarea::placeholder {
  color: var(--color-text-secondary);
}
</style> 