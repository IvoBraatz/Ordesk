<!-- src/components/FormInput.vue -->
<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      <component v-if="icon" :is="icon" class="label-icon" />
      {{ label }}
    </label>
    <input
      :type="type"
      :placeholder="placeholder"
      :aria-label="label"
      :value="modelValue"
      @input="updateValue"
      class="form-input"
    />
  </div>
</template>

<script setup>
// O seu script setup já estava ótimo e foi mantido.
const props = defineProps({
    modelValue: [String, Number],
    type: { type: String, default: 'text' },
    label: String,
    placeholder: String,
    icon: [Object, String], // Aceita um componente Vue para o ícone
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
    emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
/* --- ESTILOS 100% INTEGRADOS COM O DESIGN SYSTEM --- */

/* As variáveis de :root e .dark-mode foram removidas.
   Agora o componente usa apenas as variáveis globais. */

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm); /* Usando variável de espaçamento */
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary); /* Usando variável de texto */
}

.label-icon {
  width: 18px;
  height: 18px;
}

.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md); /* Usando variáveis de espaçamento */
  border-radius: var(--border-radius-sm); /* Usando variável de borda */
  border: 1px solid var(--color-border); /* Usando variável de borda */
  background-color: var(--color-background-component); /* Usando variável de fundo */
  color: var(--color-text-primary); /* Usando variável de texto */
  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  transition: all 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-button-update); /* Usando variável de destaque */
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-button-update) 20%, transparent);
}

.form-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}
</style>
