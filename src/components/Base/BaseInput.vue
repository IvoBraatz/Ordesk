<!-- src/components/Base/BaseInput.vue -->
<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="input-wrapper">
      <!-- 
        Componente dinâmico que renderiza <input>, <textarea>, ou <select>.
        Para o <select>, as <option>s são passadas via slot.
      -->
      <component
        :is="as"
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="base-input"
        :rows="rows"
      >
        <slot></slot>
      </component>
      <!-- Ícone de seta para o select -->
      <span v-if="as === 'select'" class="select-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Um ID único é gerado para associar o label ao input, melhorando a acessibilidade.
const id = computed(() => `base-input-${Math.random().toString(36).substring(2, 9)}`);

defineProps({
  as: {
    type: String,
    default: 'input',
    validator: (value) => ['input', 'textarea', 'select'].includes(value)
  },
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  rows: {
      type: [String, Number],
      default: 4
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: var(--space-sm);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
  width: 100%;
}

/* Estilo unificado para <input>, <textarea> e <select> */
.base-input {
  /* Reset para garantir consistência visual */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-sizing: border-box; 
  display: block;
  margin: 0;
  
  /* Estilos do nosso Design System */
  width: 100%;
  height: 44px; /* Altura padrão para alinhar com botões */
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-background-component);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.base-input:focus {
  outline: none;
  border-color: var(--color-button-update);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-button-update) 20%, transparent);
}

.base-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

/* Estilos específicos para <textarea> */
textarea.base-input {
    height: auto;
    min-height: 80px;
    resize: vertical;
}

/* Estilos específicos para <select> */
select.base-input {
    padding-right: calc(var(--space-md) + 24px); /* Espaço para a seta */
    cursor: pointer;
}

.select-arrow {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    pointer-events: none; /* Permite clicar no select através da seta */
}
</style>
