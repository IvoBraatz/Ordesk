import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importa o CSS do Splide
import '@splidejs/vue-splide/css';

// Seu CSS global
import './assets/style.css';
import './assets/styles/design-system.css';
const app = createApp(App);

// Usa o router
app.use(router);

// Monta a aplicação
app.mount('#app');
