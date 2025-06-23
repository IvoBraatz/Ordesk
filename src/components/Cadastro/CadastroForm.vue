<!-- src/components/Cadastro/CadastroForm.vue -->
<template>
  <!-- Envolvemos o formulário em um BaseCard para consistência visual -->
  <BaseCard>
    <!-- Adicionamos um título dentro do card -->
    <h2 class="form-title">Formulário de Cadastro</h2>
    <form class="ru-form" @submit.prevent="handleSubmit">
      <BaseInput
        label="Nome"
        v-model="form.nome"
        placeholder="Digite o nome completo"
      />
      <BaseInput
        label="Email"
        type="email"
        v-model="form.email"
        placeholder="exemplo@email.com"
      />
      <!-- Usando a variante 'create' que definimos no BaseButton -->
      <BaseButton variant="create" type="submit">
        Cadastrar
      </BaseButton>
    </form>
  </BaseCard>
</template>

<script setup>
import { reactive } from 'vue';
// Agora importamos também o BaseCard
import BaseCard from '../Base/BaseCard.vue';
import BaseInput from '../Base/BaseInput.vue';
import BaseButton from '../Base/BaseButton.vue';

const form = reactive({
  nome: '',
  email: ''
});

function handleSubmit() {
  // A lógica de envio permanece a mesma
  console.log('Dados do formulário:', form);
  // Idealmente, aqui você emitiria um evento para o componente pai
  // Ex: emit('submit', form)
}
</script>

<style scoped>
.form-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-top: 0;
  margin-bottom: var(--space-lg);
}

.ru-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md); /* Adiciona um espaço entre os inputs */
}

/* Alinha o botão à direita para uma aparência mais padrão em formulários */
.ru-form > .ru-button {
  align-self: flex-end;
  margin-top: var(--space-sm);
}
</style>