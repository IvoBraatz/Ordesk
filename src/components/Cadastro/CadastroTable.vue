<!-- src/components/Cadastro/CadastroTable.vue -->
<template>
  <BaseCard>
    <!-- O padding do card foi removido para a tabela ocupar todo o espaço -->
    <div class="ru-table-container">
      <table class="ru-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th class="actions-column">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuarios.length === 0">
             <td colspan="3" class="empty-state">Nenhum registro encontrado.</td>
          </tr>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td data-label="Nome">{{ usuario.nome }}</td>
            <td data-label="Email">{{ usuario.email }}</td>
            <td data-label="Ações" class="actions-cell">
              <!-- Botões para ações comuns em tabelas -->
              <BaseButton variant="update">Editar</BaseButton>
              <BaseButton variant="delete">Excluir</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../Base/BaseCard.vue';
import BaseButton from '../Base/BaseButton.vue';

defineProps({
  usuarios: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
/* Remove o padding padrão do card para a tabela poder se estender */
:deep(.base-card) {
  padding: 0;
}

.ru-table-container {
  width: 100%;
  overflow-x: auto; /* Garante a rolagem horizontal em telas pequenas */
}

.ru-table {
  width: 100%;
  border-collapse: collapse; /* Remove espaços entre as células */
  color: var(--color-text-primary);
}

th, td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

thead th {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  background-color: var(--color-background-base);
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: var(--color-background-base);
}

.actions-column {
  width: 1%; /* Faz a coluna de ações ter a menor largura possível */
  white-space: nowrap;
  text-align: right;
}

.actions-cell {
  text-align: right;
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.empty-state {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--space-xl);
}
</style>
