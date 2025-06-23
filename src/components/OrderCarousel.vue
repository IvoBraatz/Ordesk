<!-- ARQUIVO: src/components/OrderCarousel.vue -->
<template>
  <div v-if="orders.length" class="priority-section">
    <div class="priority-header" :class="priorityClass">
      <h2 class="priority-header__title">{{ title }}</h2>
      <h3 class="priority-header__count">{{ orders.length }} abertas</h3>
    </div>
    <!-- O Splide.js está de volta e funcionando como carrossel horizontal -->
    <div class="splide-container">
      <Splide :options="splideOptions">
        <SplideSlide v-for="ordem in orders" :key="ordem.id">
          <div class="ordem-card">
            <div class="ordem-card__header" :class="priorityClass">
              <h3>OS #{{ ordem.numeroOrdem }}</h3>
            </div>
            <div class="ordem-card__body">
              <p><strong>Cliente:</strong> {{ ordem.cliente }}</p>
              <p><strong>Descrição:</strong> {{ ordem.descricao }}</p>
              <p><strong>Material:</strong> {{ ordem.material }}</p>
              <p><strong>Data:</strong> {{ formatarData(ordem.dataAtual) }}</p>
              <router-link :to="`/ordem/${ordem.id}`" class="detalhes-link">
                <LucideEye class="icon" />
                Ver Detalhes
              </router-link>
            </div>
          </div>
        </SplideSlide>
      </Splide>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { LucideEye } from 'lucide-vue-next';
import moment from 'moment-timezone';

// Lembrete: Importe o CSS do Splide no seu main.js para o estilo funcionar!
// Ex: import '@splidejs/vue-splide/css/core';

defineProps({
  title: { type: String, required: true },
  orders: { type: Array, required: true },
  priorityClass: { type: String, required: true },
});

const splideOptions = {
  type: 'slide',
  perPage: 3,
  gap: '1.5rem',
  rewind: false,
  pagination: false,
  pauseOnHover: true,
  breakpoints: {
    1280: { perPage: 2, gap: '1rem' },
    768: { perPage: 1, gap: '1rem' },
  },
};

const formatarData = (data) => {
  if (!data) return '';
  return moment(data).tz('America/Sao_Paulo').format('DD/MM/YYYY');
};
</script>

<style scoped>
.priority-header {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority-header__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.priority-header__count {
  margin: 0;
  font-size: var(--font-size-md);
  opacity: 0.9;
}

.priority--urgent {
  background-color: var(--color-priority-urgent);
}

.priority--high {
  background-color: var(--color-priority-high);
}

.priority--medium {
  background-color: var(--color-priority-medium);
  color: var(--color-text-primary);
}

.priority--low {
  background-color: var(--color-priority-low);
}

.splide-container {
  padding: var(--space-lg);
  background-color: var(--color-background-component);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
}

.ordem-card {
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ordem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.ordem-card__header {
  padding: var(--space-sm) var(--space-md);
  color: #fff;
}

.ordem-card__header h3 {
  margin: 0;
  font-size: var(--font-size-md);
}

.ordem-card__body {
  padding: var(--space-md);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.ordem-card__body p {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.ordem-card__body p strong {
  color: var(--color-text-secondary);
}

.detalhes-link {
  margin-top: auto;
  padding: var(--space-sm);
  background-color: var(--color-background-base);
  color: var(--color-button-update);
  text-decoration: none;
  font-weight: var(--font-weight-bold);
  border-radius: var(--border-radius-sm);
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: background-color 0.2s, color 0.2s;
}

.detalhes-link:hover {
  background-color: var(--color-button-update);
  color: #fff;
}
</style>
