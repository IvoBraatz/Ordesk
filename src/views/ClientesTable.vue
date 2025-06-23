<template>
  <div class="clientes-table-container">
    <table class="clientes-table">
      <thead>
        <tr>
          <th class="col-select"><input type="checkbox" @change="$emit('toggle-select-all', $event)" :checked="isAllSelected" /></th>
          <th class="col-codigo">Código</th>
          <th class="col-nome">Nome</th>
          <th class="col-telefone">Telefone</th>
          <th class="col-cpfcnpj">CPF/CNPJ</th>
          <th class="col-actions">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="clientes.length === 0">
          <td colspan="6" class="no-data">Nenhum cliente encontrado.</td>
        </tr>
        <tr v-for="client in clientes" :key="client.id">
          <td class="col-select">
            <input
              type="checkbox"
              :value="client.id"
              :checked="selectedClients.includes(client.id)"
              @change="onSelectClient(client.id, $event.target.checked)"
            />
          </td>
          <td class="col-codigo">{{ client.codigoCliente }}</td>
          <td class="col-nome">{{ client.nome }}</td>
          <td class="col-telefone">{{ client.telefone }}</td>
          <td class="col-cpfcnpj">{{ client.cpfCnpj }}</td>
          <td class="col-actions">
            <button @click="$emit('edit', client)" class="action-icon" title="Editar Cliente">
              <LucidePencil />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { LucidePencil } from 'lucide-vue-next';
const props = defineProps({
  clientes: { type: Array, default: () => [] },
  selectedClients: { type: Array, default: () => [] },
  isAllSelected: { type: Boolean, default: false }
});
const emit = defineEmits(['toggle-select-all', 'edit', 'update:selectedClients']);

function onSelectClient(id, checked) {
  let updated = [...props.selectedClients];
  if (checked) {
    if (!updated.includes(id)) updated.push(id);
  } else {
    updated = updated.filter(cid => cid !== id);
  }
  emit('update:selectedClients', updated);
}
</script>

<style scoped>
.clientes-table-container {
  max-height: 420px;
  overflow-y: auto;
  background: var(--glass-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}
.clientes-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}
.clientes-table th, .clientes-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.clientes-table th {
  background: var(--bg-panel);
  position: sticky;
  top: 0;
  z-index: 1;
}
.clientes-table tbody tr:hover {
  background: var(--bg-page);
}
.no-data {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}
.col-actions {
  text-align: center;
  width: 80px;
}
.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-color);
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}
.action-icon:hover {
  background: var(--accent-hover);
  color: #fff;
}
</style> 