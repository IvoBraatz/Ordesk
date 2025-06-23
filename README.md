# 🏢 ordex - Sistema de Gestão de Ordens de Serviço

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.3.0-yellow?style=for-the-badge&logo=pinia&logoColor=white)

**Sistema completo de gestão de ordens de serviço com interface moderna e funcionalidades avançadas**

[🚀 **Demo**](#) • [📖 **Documentação**](#funcionalidades) • [🛠️ **Instalação**](#instalação)

</div>

---

## 📋 Índice

- [✨ Sobre o Projeto](#sobre-o-projeto)
- [🚀 Funcionalidades](#funcionalidades)
- [🛠️ Tecnologias Utilizadas](#tecnologias-utilizadas)
- [📦 Instalação](#instalação)
- [⚙️ Configuração](#configuração)
- [🎯 Como Usar](#como-usar)
- [🏗️ Estrutura do Projeto](#estrutura-do-projeto)
- [👥 Contribuição](#contribuição)
- [📄 Licença](#licença)

---

## ✨ Sobre o Projeto

O **Ordex** é um sistema completo de gestão de ordens de serviço desenvolvido com Vue.js 3 e Node.js. O sistema oferece uma interface moderna e intuitiva para gerenciar ordens de trabalho, clientes, serviços e usuários, com funcionalidades avançadas como sistema de prioridades, dashboard em tempo real e controle de acesso baseado em roles.

### 🎯 Principais Características

- **Interface Responsiva**: Design moderno que funciona perfeitamente em desktop e mobile
- **Sistema de Prioridades**: Classificação automática de ordens por urgência
- **Tempo Real**: Atualizações automáticas e notificações em tempo real
- **Controle de Acesso**: Sistema de autenticação e autorização baseado em roles
- **Dashboard Interativo**: Gráficos e métricas em tempo real
- **Upload de Imagens**: Suporte para anexar imagens às ordens

---

## 🚀 Funcionalidades

### 👤 Gestão de Usuários
- ✅ Login e autenticação segura
- ✅ Cadastro de usuários (apenas administradores)
- ✅ Controle de acesso baseado em roles (Admin/Usuário)
- ✅ Perfil de usuário com logout

### 📋 Gestão de Ordens
- ✅ **Abertura de Ordens**: Criação de novas ordens de serviço
- ✅ **Atendimento**: Visualização e gerenciamento de ordens pendentes
- ✅ **Sistema de Prioridades**: 
  - 🔴 **Urgente** (≤ 3 dias)
  - 🟠 **Alta** (≤ 6 dias)
  - 🟡 **Média** (≤ 9 dias)
  - 🟢 **Baixa** (> 9 dias)
- ✅ **Filtros Avançados**: Busca por cliente, descrição, data
- ✅ **Detalhes da Ordem**: Visualização completa com imagens
- ✅ **Arquivamento**: Sistema de arquivamento de ordens concluídas

### 👥 Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Busca e filtros
- ✅ Histórico de ordens por cliente

### 🔧 Gestão de Serviços
- ✅ Cadastro de tipos de serviço
- ✅ Categorização de serviços
- ✅ Preços e descrições

### 📊 Dashboard
- ✅ Métricas em tempo real
- ✅ Gráficos interativos
- ✅ Estatísticas de ordens
- ✅ Indicadores de performance

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework progressivo para interfaces
- **Vite** - Build tool e dev server
- **Vue Router** - Roteamento oficial do Vue
- **Pinia** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Chart.js** - Gráficos interativos
- **Lucide Vue** - Ícones modernos
- **Day.js** - Manipulação de datas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver MySQL
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Hash de senhas
- **CORS** - Cross-origin resource sharing
- **Express FileUpload** - Upload de arquivos

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Vue DevTools** - Ferramentas de desenvolvimento

---

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- MySQL (versão 8.0 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/ivobraatz/ordex.git
cd ordex
```

### 2. Instale as dependências
```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
npm install --prefix backend
```

### 3. Configure o banco de dados
```sql
-- Crie um banco de dados MySQL
CREATE DATABASE ordex;

-- Execute os scripts de criação das tabelas
-- (consulte a documentação do banco de dados)
```

### 4. Configure as variáveis de ambiente
```bash
# Crie um arquivo .env na raiz do projeto
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run start
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=3000
BASE_URL=http://localhost:3000

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=ordex
DB_PORT=3306

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# Configurações do Frontend
VITE_API_URL=http://localhost:3000
```

### Configuração do Banco de Dados

O sistema utiliza MySQL. Certifique-se de que:

1. O MySQL está instalado e rodando
2. O banco de dados `ordex` foi criado
3. As tabelas necessárias foram criadas
4. As credenciais no `.env` estão corretas

---

## 🎯 Como Usar

### Primeiro Acesso

1. **Acesse o sistema**: `http://localhost:3000`
2. **Faça login** com as credenciais de administrador
3. **Configure os dados básicos**:
   - Cadastre clientes
   - Configure tipos de serviço
   - Crie usuários adicionais

### Fluxo de Trabalho

1. **Abrir Ordem**: Administradores podem criar novas ordens
2. **Atender Ordens**: Visualize ordens pendentes por prioridade
3. **Gerenciar**: Atualize status, adicione imagens, feche ordens
4. **Arquivar**: Ordens concluídas são movidas para arquivo

### Níveis de Acesso

- **Administrador**: Acesso completo a todas as funcionalidades
- **Usuário**: Acesso limitado a visualização e atendimento de ordens

---

## 🏗️ Estrutura do Projeto

```
ordex/
├── 📁 backend/                 # Servidor Node.js
│   ├── 📁 src/
│   │   ├── 📁 config/         # Configurações do banco
│   │   ├── 📁 middleware/     # Middlewares Express
│   │   └── 📁 routes/         # Rotas da API
│   ├── 📁 public/             # Arquivos estáticos
│   └── server.js              # Servidor principal
├── 📁 src/                    # Frontend Vue.js
│   ├── 📁 components/         # Componentes Vue
│   │   ├── 📁 Base/          # Componentes base
│   │   ├── 📁 Cadastro/      # Componentes de cadastro
│   │   └── 📁 ServicosOrdem/ # Componentes de serviços
│   ├── 📁 views/             # Páginas da aplicação
│   ├── 📁 stores/            # Gerenciamento de estado
│   ├── 📁 router/            # Configuração de rotas
│   └── 📁 assets/            # Recursos estáticos
├── 📁 public/                # Arquivos públicos
└── package.json              # Dependências e scripts
```

### Componentes Principais

- **MainLayout**: Layout principal com sidebar e header
- **OrderCarousel**: Exibição de ordens em carrossel
- **DashboardCard**: Cards do dashboard
- **Base Components**: Componentes base reutilizáveis

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Qualidade de Código
npm run lint         # Executa ESLint
npm run format       # Formata código com Prettier
```

---

## 👥 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use **ESLint** e **Prettier** para formatação
- Siga os padrões de nomenclatura do Vue.js
- Documente funções complexas
- Teste suas mudanças antes de submeter

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Suporte

Se você encontrou algum problema ou tem alguma sugestão:

- 📧 **Email**: seu-email@exemplo.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/ivobraatz/ordex/issues)
- 💬 **Discord**: [Link do Discord]

---

<div align="center">

**Desenvolvido com ❤️ por Ivo**

[⬆️ Voltar ao topo](#ordex---sistema-de-gestão-de-ordens-de-serviço)

</div>
