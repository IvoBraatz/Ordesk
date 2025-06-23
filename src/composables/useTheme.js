// src/composables/useTheme.js
import { ref, watchEffect } from 'vue';

// Usamos um nome de variável e de item no localStorage mais descritivos.
const theme = ref(localStorage.getItem('paternolli-theme') || 'light');

// Esta função deve ser chamada uma vez no App.vue para inicializar o sistema.
export function useTheme() {
  
  // watchEffect é perfeito aqui. Ele roda imediatamente ao carregar o componente
  // e re-executa sempre que a dependência (a ref 'theme') muda.
  watchEffect(() => {
    // AQUI ESTÁ A CORREÇÃO: Em vez de usar classList, definimos o atributo `data-theme`.
    // É exatamente isso que nosso design-system.css espera.
    document.documentElement.setAttribute('data-theme', theme.value);
    
    // Salvamos a preferência do usuário no localStorage para persistência.
    localStorage.setItem('paternolli-theme', theme.value);
  });

  // Função para ser chamada pelo botão de toggle no seu layout.
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  // Expondo a 'ref' do tema e a função de toggle para serem usadas nos componentes.
  return {
    theme,
    toggleTheme,
  };
}
