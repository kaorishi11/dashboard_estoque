# Sistema de Controle de Estoque

Sistema completo para gerenciamento de estoque com autenticação de usuários, dashboard interativo e CRUD de produtos.

## Funcionalidades

- **Autenticação de Usuários**
  - Login e Cadastro
  - Sessão persistente com Supabase
  - Proteção de rotas

- **Dashboard**
  - Cards com estatísticas em tempo real
  - Gráficos de barras e pizza
  - Alertas de estoque baixo
  - Top categorias por quantidade

- **Gerenciamento de Produtos**
  - Lista completa de produtos
  - Busca por nome/categoria
  - Filtro por categoria
  - Adicionar, editar e excluir produtos
  - Controle de quantidade mínima

- **Perfil do Usuário**
  - Editar nome e foto
  - Visualização de dados da conta
  - Logout seguro

## Tecnologias Utilizadas

- **Frontend:**
  - React 18
  - React Router DOM
  - Chart.js (gráficos)
  - React Icons
  - CSS3 (design responsivo)

- **Backend:**
  - Supabase (Auth + Database)

- **Ferramentas:**
  - Vite
  - Git

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma conta no [Supabase](https://supabase.com/)

## Como executar o projeto

### 1. Clone o repositório

git clone 
cd 

### 2. Instale as dependências

npm install

### 3. Configure o Supabase

Arquivo .env na raiz do projeto:
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

### 4. Configure o banco de dados no Supabase

Execute os seguintes SQLs no Supabase:

### 5. Execute o projeto

npm run dev

## Estrutura do Projeto
sistema-estoque/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Cadastro.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Novo.jsx
│   │   ├── Editar.jsx
│   │   └── Perfil.jsx
│   ├── services/
│   │   └── supabase.js
│   ├── styles/
│   │   ├── Login.css
│   │   ├── Cadastro.css
│   │   ├── Dashboard.css
│   │   ├── Home.css
│   │   ├── Novo.css
│   │   ├── Editar.css
│   │   └── Perfil.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── README.md

## Respon

- kaorishi11
