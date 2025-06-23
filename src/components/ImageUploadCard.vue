<!-- src/components/ImageUploadCard.vue -->
<template>
  <div class="image-card">
    <h3 class="image-card__title">{{ title }}</h3>
    <div class="image-card__body">
      <!-- MODO DE VISUALIZAÇÃO -->
      <div v-if="imageUrl && !isEditing" class="image-display">
        <img :src="imageUrl" :alt="title" @click="isModalVisible = true" />
        <button v-if="isEditable" @click="isEditing = true" class="btn-icon--edit" title="Editar Imagem">
          <LucideEdit />
        </button>
      </div>

      <!-- MODO DE UPLOAD/EDIÇÃO -->
      <div v-else class="uploader">
        <div class="dropzone" :class="{ 'drag-over': isDragOver }" @click="triggerFileInput" @dragover.prevent
          @dragenter.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop">
          <div v-if="previewUrl" class="image-preview">
            <img :src="previewUrl" alt="Pré-visualização" />
          </div>
          <div v-else class="dropzone__text">
            <LucideImageDown />
            <p>Arraste e solte ou <strong>clique aqui</strong></p>
          </div>
          <input ref="fileInput" type="file" @change="handleFileSelect" class="uploader__input" accept="image/*" />
        </div>
        <div class="uploader__actions">
          <BaseButton type="button" variant="update" @click="openCamera">
            <LucideCamera /> Câmera
          </BaseButton>
          <BaseButton v-if="isEditing && imageUrl" type="button" variant="secondary" @click="cancelEdit">Cancelar
          </BaseButton>
          <BaseButton type="button" variant="create" @click="saveImage" :disabled="!selectedFile">
            <LucideSave /> Salvar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- MODAL DE VISUALIZAÇÃO -->
    <div v-if="isModalVisible" class="modal-overlay" @click="isModalVisible = false">
      <img :src="imageUrl" class="modal-overlay__image" />
    </div>

    <!-- MODAL DA CÂMERA -->
    <div v-if="isCameraOpen" class="modal-overlay">
      <div class="camera-modal">
        <video ref="videoPlayer" autoplay playsinline class="camera-modal__video"></video>
        <div class="camera-modal__actions">
          <BaseButton @click="takePhoto" variant="create">
            <LucideCamera /> Capturar
          </BaseButton>
          <BaseButton @click="closeCamera" variant="delete">Fechar</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { LucideEdit, LucideImageDown, LucideCamera, LucideSave } from 'lucide-vue-next';
// Importando o BaseButton para ser usado no template
import BaseButton from './Base/BaseButton.vue';

// A lógica do script foi mantida, pois já estava excelente.
const props = defineProps({
  title: { type: String, required: true },
  imageUrl: { type: String, default: null },
  isEditable: { type: Boolean, default: true },
});
const emit = defineEmits(['image-saved']);

const isEditing = ref(false);
const isDragOver = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const fileInput = ref(null);
const isModalVisible = ref(false);
const isCameraOpen = ref(false);
const videoPlayer = ref(null);
let cameraStream = null;

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};
const handleDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};
const triggerFileInput = () => fileInput.value.click();

const saveImage = () => {
  if (selectedFile.value) {
    emit('image-saved', selectedFile.value);
    isEditing.value = false;
    previewUrl.value = null;
    selectedFile.value = null;
  }
};
const cancelEdit = () => {
  isEditing.value = false;
  previewUrl.value = null;
  selectedFile.value = null;
};

const openCamera = async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    isCameraOpen.value = true;
    setTimeout(() => {
      if (videoPlayer.value) videoPlayer.value.srcObject = cameraStream;
    }, 0);
  } catch (err) { alert("Não foi possível acessar a câmera."); }
};
const takePhoto = () => {
  const canvas = document.createElement("canvas");
  canvas.width = videoPlayer.value.videoWidth;
  canvas.height = videoPlayer.value.videoHeight;
  canvas.getContext("2d").drawImage(videoPlayer.value, 0, 0);
  closeCamera();
  canvas.toBlob((blob) => {
    const photoFile = new File([blob], "foto.jpg", { type: "image/jpeg" });
    selectedFile.value = photoFile;
    previewUrl.value = URL.createObjectURL(photoFile);
  });
};
const closeCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }
  isCameraOpen.value = false;
};

if (!props.imageUrl) {
  isEditing.value = true;
}
</script>

<style scoped>
/* Estilos 100% integrados com o Design System */
.image-card {
  background-color: var(--color-background-component);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 280px;
}

.image-card__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  margin: 0;
}

.image-card__body {
  padding: var(--space-lg);
  flex-grow: 1;
}

/* Visualização da Imagem */
.image-display {
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  cursor: pointer;
  background-color: var(--color-background-base);
}

.image-display img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-icon--edit {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 0.2s;
}

.btn-icon--edit:hover {
  background-color: var(--color-button-update);
}


/* Uploader e Dropzone */
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dropzone.drag-over,
.dropzone:hover {
  border-color: var(--color-button-update);
  background-color: var(--color-background-base);
}

.dropzone__text {
  text-align: center;
  color: var(--color-text-secondary);
}

.dropzone__text svg {
  margin: 0 auto 0.5rem auto;
  display: block;
}

.dropzone__text strong {
  color: var(--color-text-highlight);
}

.image-preview {
  width: 100%;
  height: 100%;
  padding: var(--space-xs);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--border-radius-sm);
}

.uploader__input {
  display: none;
}

.uploader__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}


/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal-overlay__image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: var(--border-radius-md);
}

.camera-modal {
  background-color: var(--color-background-component);
  padding: var(--space-lg);
  border-radius: var(--border-radius-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.camera-modal__video {
  width: 100%;
  max-width: 500px;
  border-radius: var(--border-radius-sm);
}

.camera-modal__actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}
</style>
