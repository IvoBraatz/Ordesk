<template>
  <MainLayout />
</template>

<script setup>
import MainLayout from "./views/MainLayout.vue";
import { useTheme } from "./composables/useTheme";

// Inicializa a lógica do tema globalmente
useTheme();
</script>
