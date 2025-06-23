<!-- src/views/PaginaAberturaOrdem.vue -->
<template>
  <div class="page-container">
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="spinner"></div>
      <p>Abrindo ordem...</p>
    </div>

    <BaseCard class="form-card">
      <header class="form-header">
        <LucideFilePlus class="form-header__icon" />
        <h1 class="form-header__title">Abertura de Nova Ordem</h1>
      </header>

      <form @submit.prevent="abrirOrdem" class="abertura-form">
        <fieldset class="form-fieldset">
          <legend class="fieldset-legend">Informações da Ordem</legend>
          <div class="form-grid">
            <BaseInput class="col-span-3" label="Número da Ordem *" v-model="form.numeroOrdem" required />
            <BaseInput class="col-span-3" label="Prazo Final *" type="date" v-model="form.prazoEntrega" required
              :min="today" />
            <AutocompleteClient class="col-span-6" v-model="form.cliente" @clienteSelecionado="preencherDadosCliente" />
            <BaseInput class="col-span-3" label="Telefone *" v-model="form.telefone" required />
            <BaseInput class="col-span-3" label="CPF/CNPJ *" v-model="form.cpfCnpj" required />
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend class="fieldset-legend">Detalhes do Serviço</legend>
          <div class="form-grid">
            <BaseInput class="col-span-3" label="Solicitante *" v-model="form.solicitante" required />
            <BaseInput class="col-span-3" label="Departamento *" v-model="form.departamento" required />

            <!-- AQUI ESTÁ A MUDANÇA: Usando BaseInput para a textarea -->
            <BaseInput as="textarea" class="col-span-6" label="Descrição da Peça/Serviço *" v-model="form.descricao"
              required />

            <BaseInput class="col-span-3" label="Quantidade *" type="number" v-model="form.quantidade" min="1"
              required />
            <BaseInput class="col-span-3" label="Material *" v-model="form.material" required />

            <!-- AQUI ESTÁ A MUDANÇA: Usando BaseInput para a textarea -->
            <BaseInput as="textarea" class="col-span-6" label="Observação" v-model="form.observacao" />
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend class="fieldset-legend">Anexos</legend>
          <ImageUploader @image-updated="onImageUpdate" />
        </fieldset>

        <div class="form-actions">
          <BaseButton type="submit" variant="create" :disabled="isSubmitting">
            <LucideCheckCircle class="icon" />
            Abrir Ordem
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { LucideCheckCircle, LucideFilePlus } from "lucide-vue-next";
// Importando os componentes
import AutocompleteClient from '../components/AutocompleteClient.vue';
import ImageUploader from '../components/ImageUploader.vue';
import BaseCard from '../components/Base/BaseCard.vue';
import BaseInput from '../components/Base/BaseInput.vue';
import BaseButton from '../components/Base/BaseButton.vue';

const router = useRouter();
const isSubmitting = ref(false);

const form = reactive({
  numeroOrdem: "",
  prazoEntrega: "",
  cliente: "",
  telefone: "",
  cpfCnpj: "",
  solicitante: "",
  departamento: "",
  descricao: "",
  quantidade: 1,
  material: "",
  observacao: "",
  imagem: null,
});

const today = new Date().toISOString().split('T')[0];

const preencherDadosCliente = (cliente) => {
  form.telefone = cliente.telefone_principal || cliente.telefone;
  form.cpfCnpj = cliente.cpfCnpj || cliente.cpf_cnpj;
};

const onImageUpdate = (file) => {
  form.imagem = file;
};

const abrirOrdem = async () => {
  isSubmitting.value = true;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const formData = new FormData();
    // Preenche o formData com os dados do formulário
    for (const key in form) {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    }
    formData.set("dataAtual", new Date().toISOString().split('T')[0]);
    if (form.imagem) {
      formData.set("imagens", form.imagem); // 'imagens' para corresponder ao backend
    } else {
      formData.delete('imagem'); // remove a chave 'imagem' se não houver arquivo
    }


    await axios.post(`${apiUrl}/orders`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    alert("Ordem criada com sucesso!");
    router.push("/");

  } catch (err) {
    console.error("Erro ao criar ordem:", err);
    alert("Ocorreu um erro ao criar a ordem. Verifique os dados e tente novamente.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.page-container {
  padding: var(--space-lg);
  background-color: var(--color-background-base);
}

.form-card {
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-md);
}

.form-header__icon {
  width: 32px;
  height: 32px;
  color: var(--color-button-create);
}

.form-fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.fieldset-legend {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text-secondary);
  padding: 0 var(--space-sm);
  margin-left: var(--space-md);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-lg);
  align-items: flex-start;
  /* Alinha os BaseInputs corretamente */
}

/* O BaseInput já contém a classe .form-group, então não precisamos de estilos para ela aqui */
.col-span-1 {
  grid-column: span 1;
}

.col-span-2 {
  grid-column: span 2;
}

.col-span-3 {
  grid-column: span 3;
}

.col-span-4 {
  grid-column: span 4;
}

.col-span-5 {
  grid-column: span 5;
}

.col-span-6 {
  grid-column: span 6;
}


.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--color-background-component) 80%, transparent);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-border);
  border-top-color: var(--color-button-create);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  margin-top: 1rem;
  font-weight: 500;
  font-size: 1.1rem;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .col-span-1,
  .col-span-2,
  .col-span-3,
  .col-span-4,
  .col-span-5,
  .col-span-6 {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-span-1,
  .col-span-2,
  .col-span-3,
  .col-span-4,
  .col-span-5,
  .col-span-6 {
    grid-column: span 1;
  }
}
</style>
