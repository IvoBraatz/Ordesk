<!-- src/components/ImageUploader.vue -->
<template>
  <div class="image-upload-wrapper">
    <div class="dropzone" :class="{
      'dropzone--dragover': isDragOver,
      'has-image': previewImage,
      'has-error': error
    }" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="onDrop"
      @click="triggerFileInput">
      <div v-if="isLoading" class="state-overlay">
        <div class="spinner"></div>
        <p>Processando...</p>
      </div>

      <template v-if="previewImage">
        <img :src="previewImage" alt="Pré-visualização" class="dropzone__image-preview" />
        <button type="button" class="remove-image-btn" @click.stop="removeImage" title="Remover Imagem">
          <LucideX />
        </button>
      </template>

      <template v-else>
        <div class="dropzone__content">
          <LucideImageDown v-if="!error" class="dropzone__icon" />
          <LucideAlertCircle v-else class="dropzone__icon icon--error" />
          <p v-if="!error" class="dropzone__text">Arraste e solte ou <strong>clique aqui</strong></p>
          <p v-else class="dropzone__text text--error">{{ error }}</p>
          <span class="dropzone__subtext">PNG, JPG ou GIF - Máx 5MB</span>
        </div>
      </template>

      <input ref="fileInput" type="file" accept="image/png, image/jpeg, image/gif" @change="handleImageUpload"
        class="dropzone__input" :disabled="isLoading" />
    </div>

    <!-- Botões são componentizados usando BaseButton -->
    <BaseButton type="button" variant="update" @click.stop="openCamera" :disabled="isLoading" class="btn--full">
      <LucideCamera />
      Usar Câmera
    </BaseButton>

    <div v-if="cameraActive" class="camera-modal">
      <div class="camera-modal__content" @click.stop>
        <video ref="video" autoplay playsinline class="camera-modal__video-preview"></video>
        <div class="camera-modal__buttons">
          <BaseButton variant="create" @click="takePhoto">
            <LucideAperture /> Capturar
          </BaseButton>
          <BaseButton variant="delete" @click="closeCamera">
            <LucideX /> Fechar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  LucideImageDown,
  LucideCamera,
  LucideX,
  LucideAperture,
  LucideAlertCircle
} from 'lucide-vue-next';
import BaseButton from './Base/BaseButton.vue'; // Importando nosso componente

// A lógica do script foi mantida, pois já estava excelente.
const emit = defineEmits(['image-updated']);

const isDragOver = ref(false);
const isLoading = ref(false);
const previewImage = ref(null);
const error = ref('');
const fileInput = ref(null);
const video = ref(null);
const cameraActive = ref(false);
let cameraStream = null;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const processFile = (file) => {
  error.value = '';
  isLoading.value = true;
  if (!file) {
    isLoading.value = false;
    return;
  }
  if (!file.type.startsWith('image/')) {
    setError('Formato inválido. Use PNG, JPG ou GIF.');
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    setError(`Arquivo muito grande. O máximo é ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    return;
  }
  setTimeout(() => {
    previewImage.value = URL.createObjectURL(file);
    emit('image-updated', file);
    isLoading.value = false;
    isDragOver.value = false;
  }, 300);
};

const setError = (message) => {
  error.value = message;
  isLoading.value = false;
  emit('image-updated', null);
  setTimeout(() => { error.value = ''; }, 5000);
}

const removeImage = () => {
  previewImage.value = null;
  fileInput.value.value = '';
  emit('image-updated', null);
}

const onDrop = (event) => {
  isDragOver.value = false;
  processFile(event.dataTransfer.files[0]);
};

const handleImageUpload = (event) => {
  processFile(event.target.files[0]);
};

const triggerFileInput = () => {
  if (isLoading.value || previewImage.value) return;
  error.value = '';
  fileInput.value.click();
};

const openCamera = async () => { /* ... */ };
const takePhoto = () => { /* ... */ };
const closeCamera = () => { /* ... */ };
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
}

.dropzone {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-md);
  min-height: 220px;
  background-color: var(--color-background-base);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dropzone:not(.has-image):not(.has-error):hover {
  border-color: var(--color-button-update);
  background-color: var(--color-background-component);
}

.dropzone.dropzone--dragover {
  border-color: var(--color-button-update);
  transform: scale(1.02);
  box-shadow: var(--shadow-card);
}

.dropzone.has-error {
  border-color: var(--color-priority-urgent);
  background-color: color-mix(in srgb, var(--color-priority-urgent) 10%, transparent);
}

.dropzone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-secondary);
}

.dropzone__icon {
  width: 48px;
  height: 48px;
  color: var(--color-button-update);
  transition: transform 0.3s;
}

.dropzone__icon.icon--error {
  color: var(--color-priority-urgent);
}

.dropzone:hover .dropzone__icon:not(.icon--error) {
  transform: scale(1.1);
}

.dropzone__text {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.dropzone__text.text--error {
  color: var(--color-priority-urgent);
}

.dropzone__subtext {
  font-size: var(--font-size-sm);
}

/* Preview da Imagem */
.dropzone__image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.remove-image-btn {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.remove-image-btn:hover {
  background-color: var(--color-button-delete);
  transform: scale(1.1);
}

.dropzone__input {
  display: none;
}

/* Overlay de Loading */
.state-overlay {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--color-background-component) 80%, transparent);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-button-update);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn--full {
  width: 100%;
}

/* Modal da Câmera */
.camera-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.camera-modal__content {
  background-color: var(--color-background-component);
  padding: var(--space-lg);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: 90vw;
}

.camera-modal__video-preview {
  border-radius: var(--border-radius-sm);
  width: 100%;
}

.camera-modal__buttons {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}
</style>
