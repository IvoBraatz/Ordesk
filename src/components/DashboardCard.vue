<!-- src/components/DashboardCard.vue -->
<template>
  <BaseCard class="dashboard-card">
    <div class="card-header">
      <h2 class="card-title">{{ title }}</h2>
      <slot name="header-extra"></slot>
    </div>
    <div class="card-content">
      <div v-if="isLoading" class="state-overlay">
        <div class="spinner"></div>
      </div>
      <div v-else-if="error" class="state-overlay">
        <span class="error-text">⚠️ {{ error }}</span>
      </div>
      <div v-else-if="isEmpty" class="state-overlay">
        <span class="empty-text">Nenhum dado para exibir.</span>
      </div>
      <slot v-else></slot>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './Base/BaseCard.vue';

defineProps({
  title: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: null },
  isEmpty: { type: Boolean, default: false },
});
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.dashboard-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  height: 400px;
  background-color: var(--color-background-component);
  /* Altura padrão para os cards */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-content {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-md);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.error-text {
  color: var(--color-button-delete);
  font-weight: 600;
}

.empty-text {
  font-style: italic;
}

.spinner {
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-button-update);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
