# TaskMaster Frontend

Frontend React moderno para o sistema de gerenciamento de tarefas TaskMaster.

## 🚀 Características

- **Design Moderno**: Interface baseada na identidade visual da apresentação
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Autenticação Completa**: Login, registro e proteção de rotas
- **Gerenciamento de Estado**: React Query para cache e sincronização
- **Componentes Reutilizáveis**: Baseados em shadcn/ui
- **TypeScript Ready**: Estrutura preparada para TypeScript

## 🎨 Design System

### Cores
- **Primary**: Roxo/Violeta (#6B46C1, #8B5CF6)
- **Accent**: Verde (#10B981, #34D399)
- **Background**: Tons de cinza claro
- **Text**: Tons de cinza escuro

### Componentes
- Cards com sombras sutis
- Botões com estados hover
- Formulários com validação
- Badges coloridos para categorias e tags
- Progress bars para acompanhamento

## 📱 Páginas Implementadas

### Públicas
- **Landing Page** (`/`) - Apresentação do produto
- **Login** (`/login`) - Autenticação de usuários
- **Registro** (`/register`) - Criação de conta

### Protegidas (requer autenticação)
- **Dashboard** (`/app`) - Visão geral e estatísticas
- **Tarefas** (`/app/tasks`) - Gerenciamento de tarefas
- **Categorias** (`/app/categories`) - Organização por categorias
- **Tags** (`/app/tags`) - Sistema de etiquetas
- **Listas** (`/app/lists`) - Agrupamento de tarefas
- **Perfil** (`/app/profile`) - Configurações do usuário

## 🛠 Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router** - Navegação entre páginas
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes base
- **Lucide React** - Ícones
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **Axios** - Requisições HTTP
- **Vite** - Build tool

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm/yarn)

### Instalação
```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview da build
pnpm run preview
```

### Configuração da API
Por padrão, a aplicação está configurada para se conectar com a API Django em:
```
http://localhost:8000/api
```

Para alterar, edite o arquivo `src/contexts/AuthContext.jsx`:
```javascript
const API_BASE_URL = 'http://seu-backend.com/api'
```

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes reutilizáveis
│   ├── ui/         # Componentes base (shadcn/ui)
│   ├── Header.jsx  # Cabeçalho da aplicação
│   ├── Layout.jsx  # Layout principal
│   └── Sidebar.jsx # Menu lateral
├── contexts/        # Contextos React
│   └── AuthContext.jsx # Autenticação
├── pages/          # Páginas da aplicação
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── TasksPage.jsx
│   ├── CategoriesPage.jsx
│   ├── TagsPage.jsx
│   ├── ListsPage.jsx
│   └── ProfilePage.jsx
├── App.jsx         # Componente principal
├── App.css         # Estilos globais
└── main.jsx        # Ponto de entrada
```

## 🔗 Integração com Backend

A aplicação está preparada para integrar com a API Django TaskMaster:

### Endpoints Utilizados
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Registro
- `GET /api/auth/user/` - Dados do usuário
- `GET /api/tasks/` - Lista de tarefas
- `POST /api/tasks/` - Criar tarefa
- `POST /api/tasks/{id}/complete/` - Marcar como concluída
- `GET /api/categories/` - Lista de categorias
- `GET /api/tags/` - Lista de tags
- `GET /api/lists/` - Lista de listas

### Autenticação
- Token-based authentication
- Token armazenado no localStorage
- Headers automáticos configurados no Axios
- Redirecionamento automático para login

## 🎯 Funcionalidades Implementadas

### Autenticação
- [x] Login com validação
- [x] Registro com validação completa
- [x] Logout
- [x] Proteção de rotas
- [x] Persistência de sessão

### Dashboard
- [x] Estatísticas gerais
- [x] Tarefas recentes
- [x] Progresso de conclusão
- [x] Tarefas para hoje
- [x] Tarefas atrasadas

### Tarefas
- [x] Listagem com filtros
- [x] Busca por texto
- [x] Filtros por prioridade e status
- [x] Organização em tabs
- [x] Marcar como concluída
- [x] Indicadores visuais de prioridade
- [x] Badges para categorias e tags

### Interface
- [x] Design responsivo
- [x] Sidebar colapsível
- [x] Header com busca
- [x] Cards informativos
- [x] Loading states
- [x] Estados vazios

## 🔮 Próximas Funcionalidades

### Formulários
- [ ] Modal para criar/editar tarefas
- [ ] Formulários para categorias
- [ ] Formulários para tags
- [ ] Formulários para listas

### Funcionalidades Avançadas
- [ ] Drag & drop para reordenar
- [ ] Notificações em tempo real
- [ ] Modo escuro
- [ ] Filtros avançados
- [ ] Relatórios e gráficos
- [ ] Exportação de dados

### UX/UI
- [ ] Animações de transição
- [ ] Skeleton loading
- [ ] Toast notifications
- [ ] Confirmações de ações
- [ ] Atalhos de teclado

## 🚀 Deploy

### Desenvolvimento
```bash
pnpm run dev --host
```

### Produção
```bash
pnpm run build
```

Os arquivos de build estarão em `dist/` e podem ser servidos por qualquer servidor web estático.

## 📝 Notas de Desenvolvimento

- Projeto criado com template React moderno
- Configurado com ESLint e Prettier
- Cores personalizadas baseadas na apresentação
- Componentes preparados para expansão
- Estrutura escalável e organizada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

