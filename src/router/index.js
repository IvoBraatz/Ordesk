import { createRouter, createWebHistory } from "vue-router";
import PaginaLogin from "../views/PaginaLogin.vue";
import PaginaCadastroUsuario from "../views/PaginaCadastroUsuario.vue";
import PaginaCadastroClientes from "../views/PaginaCadastroClientes.vue";
import PaginaAberturaOrdens from "../views/PaginaAberturaOrdens.vue";
import PaginaCadastroServicos from "../views/PaginaCadastroServicos.vue";
import PaginaAtendimentoOrdens from "../views/PaginaAtendimentoOrdens.vue";
import PaginaOrdemDetalhes from "../views/PaginaOrdemDetalhes.vue";
import ArchivedOrders from "@/views/ArchivedOrders.vue";
import axios from "axios";
import { setAuthenticated } from "../stores/authState";
import PaginaOrdensFechadas from "../views/PaginaOrdensFechadas.vue";
import DashboardPanel from "../views/DashboardPanel.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: PaginaLogin,
  },
  {
    path: "/register",
    name: "CadastroUsuario",
    component: PaginaCadastroUsuario,
    meta: { requiresAdmin: true },
  },
  {
    path: "/ordens-fechadas",
    name: "OrdensFechadas",
    component: PaginaOrdensFechadas,
    meta: { requiresAdmin: true },
  },
  {
    path: "/cadastro-clientes",
    name: "CadastroClientes",
    component: PaginaCadastroClientes,
    meta: { requiresAdmin: true },
  },
  {
    path: "/",
    name: "AtendimentoOrdens",
    component: PaginaAtendimentoOrdens,
  },
  {
    path: "/abertura-ordens",
    name: "AberturaOrdens",
    component: PaginaAberturaOrdens,
    meta: { requiresAdmin: true },
  },
  {
    path: "/cadastro-servicos",
    name: "CadastroServicos",
    component: PaginaCadastroServicos,
    meta: { requiresAdmin: true },
  },
  {
    path: "/ordem/:id",
    name: "OrdemDetalhes",
    component: PaginaOrdemDetalhes,
    meta: { requiresAuth: false },
  },
  {
    path: "/ArchivedOrders",
    name: "ArchivedOrders",
    component: ArchivedOrders,
    meta: { requiresAdmin: true },
  },
  {
    path: "/DashboardPanel",
    name: "DashboardPanel",
    component: DashboardPanel,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("authToken");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  console.log("Rota acessada:", to.path);
  console.log("Token encontrado:", token);

  if (to.meta.requiresAuth || to.meta.requiresAdmin) {
    if (!token) {
      console.log("🔴 Nenhum token encontrado. Redirecionando para login.");
      return next("/login");
    }

    try {
      const response = await axios.post(`${apiUrl}/auth/validate`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;

      console.log("🟢 Usuário autenticado:", user);

      setAuthenticated(true, Number(user.user_type) === 1, user);

      if (to.meta.requiresAdmin && Number(user.user_type) !== 1) {
        console.log("🔴 Usuário sem permissão de admin. Redirecionando.");
        return next("/");
      }
    } catch (err) {
      console.error("⚠️ Erro ao validar token:", err.response?.data || err.message);
      localStorage.removeItem("authToken");
      setAuthenticated(false);
      return next("/login");
    }
  }

  next();
});


export default router;
