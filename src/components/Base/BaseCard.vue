<!-- src/components/Base/BaseCard.vue -->
<template>
  <div class="base-card">
    <slot></slot>
  </div>
</template>

<script setup>
// Componente puramente visual, não precisa de script.
</script>

<style scoped>
.base-card {
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
  /* A largura (width) e altura (height) agora são controladas pelo componente pai.
    Isso torna o BaseCard muito mais flexível e reutilizável.
  */
}
</style>
