<!-- src/components/Alert.vue -->
<template>
  <p :class="['ru-alert', `ru-alert--${type}`]">
    <slot />
  </p>
</template>

<script setup>
defineProps({
  // Adicionamos 'warning' e 'info' como opções
  type: {
    type: String,
    default: 'info', // success, error, warning, info
  },
});
</script>

<style scoped>
.ru-alert {
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-bold);
  color: #fff;
  margin: var(--space-md) 0;
}

/* Mapeando os tipos para as cores do Design System */
.ru-alert--info {
  background-color: var(--color-button-update);
}
.ru-alert--success {
  background-color: var(--color-priority-low);
}
.ru-alert--warning {
  background-color: var(--color-priority-medium);
  color: var(--color-text-primary); /* Texto escuro para melhor contraste */
}
.ru-alert--error {
  background-color: var(--color-priority-urgent);
}
</style>
