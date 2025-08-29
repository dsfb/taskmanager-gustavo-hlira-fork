# TaskManager - Sistema de Gerenciamento de Tarefas

Sistema completo de gerenciamento de tarefas desenvolvido com Django e Django REST Framework (DRF).

## 🚀 Características Principais

- ✅ **Tarefas Flexíveis**: Crie tarefas independentes ou organizadas em listas
- 📋 **Listas Personalizadas**: Agrupe tarefas por contexto ou projeto
- 🏷️ **Categorias e Etiquetas**: Sistema de classificação avançado
- ⏰ **Lembretes e Prioridades**: Controle total sobre prazos e importância
- 📊 **Histórico Completo**: Acompanhe o progresso e conclusões
- 🔐 **Autenticação Segura**: Sistema baseado no Django nativo
- 🌐 **API REST Completa**: Integração fácil com frontends
- 🎛️ **Interface Admin**: Painel administrativo completo
- 🔍 **Filtros Avançados**: Busca e filtros por múltiplos critérios

## 🛠️ Tecnologias Utilizadas

- **Backend**: Django 5.2.5
- **API**: Django REST Framework 3.16.1
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: Token Authentication + Session Authentication
- **CORS**: django-cors-headers para integração frontend
- **Filtros**: django-filter para filtros avançados

## 📁 Estrutura do Projeto

```
taskmanager/
├── manage.py
├── requirements.txt
├── README.md
├── API_DOCUMENTATION.md
├── MODELS_DOCUMENTATION.md
├── taskmanager/          # Configurações principais
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/             # Autenticação e usuários
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── tasks/                # Modelos e lógica de tarefas
│   ├── models.py         # Task, Subtask, TaskHistory
│   ├── serializers.py
│   ├── views.py
│   ├── admin.py
│   └── urls.py
├── lists/                # Gerenciamento de listas
├── categories/           # Sistema de categorias
└── tags/                 # Sistema de etiquetas
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Python 3.11+
- pip

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute as migrações**
   ```bash
   python manage.py migrate
   ```

4. **Crie um superusuário**
   ```bash
   python manage.py createsuperuser
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   python manage.py runserver
   ```

6. **Acesse a aplicação**
   - API Root: http://localhost:8000/
   - Admin Interface: http://localhost:8000/admin/
   - API Browsable: http://localhost:8000/api/

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/user/` - Perfil do usuário

### Tarefas
- `GET /api/tasks/` - Listar tarefas (com filtros)
- `POST /api/tasks/` - Criar tarefa
- `GET /api/tasks/{id}/` - Detalhes da tarefa
- `PUT /api/tasks/{id}/` - Atualizar tarefa
- `DELETE /api/tasks/{id}/` - Excluir tarefa
- `POST /api/tasks/{id}/complete/` - Marcar como concluída
- `POST /api/tasks/{id}/uncomplete/` - Desmarcar conclusão
- `GET /api/tasks/overdue/` - Tarefas atrasadas
- `GET /api/tasks/today/` - Tarefas para hoje

### Subtarefas
- `GET /api/tasks/{task_id}/subtasks/` - Listar subtarefas
- `POST /api/tasks/{task_id}/subtasks/` - Criar subtarefa
- `GET /api/subtasks/{id}/` - Detalhes da subtarefa
- `PUT /api/subtasks/{id}/` - Atualizar subtarefa
- `DELETE /api/subtasks/{id}/` - Excluir subtarefa

### Listas, Categorias e Tags
- `GET|POST /api/lists/` - Gerenciar listas
- `GET|POST /api/categories/` - Gerenciar categorias
- `GET|POST /api/tags/` - Gerenciar etiquetas

## 🔍 Filtros e Busca

A API suporta filtros avançados:

```bash
# Tarefas concluídas
GET /api/tasks/?completed=true

# Tarefas por prioridade
GET /api/tasks/?priority=high

# Tarefas por categoria
GET /api/tasks/?category=1

# Busca textual
GET /api/tasks/?search=reunião

# Ordenação
GET /api/tasks/?ordering=-due_date

# Filtros combinados
GET /api/tasks/?completed=false&priority=high&search=projeto
```

## 📊 Modelos de Dados

### Task (Tarefa Principal)
- Título, descrição, data limite
- Prioridade (baixa, média, alta)
- Status de conclusão
- Lembretes e duração estimada
- Relacionamentos com lista, categoria, tags

### Subtask (Subtarefas)
- Decomposição de tarefas complexas
- Ordenação personalizada
- Status independente

### TaskList (Listas)
- Agrupamento de tarefas
- Configurações personalizadas
- Sugestões automáticas

### Category (Categorias)
- Classificação por contexto
- Cores personalizadas
- Estatísticas de conclusão

### Tag (Etiquetas)
- Marcação flexível
- Relacionamento N:N com tarefas
- Cores personalizadas

### TaskHistory (Histórico)
- Registro de conclusões
- Duração real vs estimada
- Observações e notas

## 🎛️ Interface Administrativa

O Django Admin está completamente configurado com:

- **Listagens otimizadas** com filtros e busca
- **Edição inline** de subtarefas e histórico
- **Campos calculados** (contadores, porcentagens)
- **Filtros laterais** por usuário, status, datas
- **Busca textual** em títulos e descrições
- **Organização em fieldsets** para melhor UX

Acesse em: http://localhost:8000/admin/

## 🔐 Autenticação e Segurança

### Sistema de Autenticação
- **Token Authentication**: Para APIs
- **Session Authentication**: Para interface web
- **Registro automático**: Criação de token no registro
- **Logout seguro**: Remoção de tokens

### Permissões e Isolamento
- **Dados por usuário**: Isolamento completo
- **Validação de propriedade**: Em todos os endpoints
- **Permissões granulares**: Por modelo e ação
- **CORS configurado**: Para desenvolvimento

## 📈 Funcionalidades Avançadas

### Métodos Inteligentes
- Cálculo automático de porcentagens de conclusão
- Verificação de tarefas atrasadas
- Contadores de progresso em tempo real
- Validação de regras de negócio

### Otimizações de Performance
- **Índices de banco**: Para consultas frequentes
- **Select/Prefetch related**: Otimização de queries
- **Paginação automática**: 20 itens por página
- **Campos calculados**: Cache de estatísticas

### Validações e Regras
- **Cores hexadecimais**: Validação de formato
- **Nomes únicos**: Por usuário em categorias/tags/listas
- **Subtarefas obrigatórias**: Para conclusão de tarefas
- **Timestamps automáticos**: Gerenciamento de datas

## 🧪 Testes e Validação

### Testes Realizados
✅ **Modelos**: Criação, relacionamentos, métodos  
✅ **API**: Todos os endpoints funcionais  
✅ **Autenticação**: Login, logout, permissões  
✅ **Filtros**: Busca e filtros avançados  
✅ **Admin**: Interface administrativa completa  
✅ **Validações**: Regras de negócio implementadas  

### Dados de Teste
O sistema inclui dados de exemplo para demonstração:
- Usuário: `testuser` / `testpass123`
- Admin: `admin` / `admin123`
- Categoria: "Trabalho"
- Tag: "Urgente"
- Lista: "Projeto TaskManager"
- Tarefa: "Implementar modelos de dados"

## 📚 Documentação

- **README.md**: Visão geral e instalação
- **API_DOCUMENTATION.md**: Documentação completa da API
- **MODELS_DOCUMENTATION.md**: Estrutura de dados detalhada

## 🚀 Deploy e Produção

### Configurações para Produção
1. **Banco de dados**: Migrar para PostgreSQL
2. **Variáveis de ambiente**: Usar python-decouple
3. **Debug**: Definir `DEBUG = False`
4. **CORS**: Configurar origens específicas
5. **Rate limiting**: Implementar limitação de requisições
6. **HTTPS**: Configurar SSL/TLS
7. **Static files**: Configurar servimento de arquivos estáticos

### Exemplo de Deploy
```bash
# Instalar dependências de produção
pip install gunicorn psycopg2-binary

# Configurar banco PostgreSQL
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic

# Executar com Gunicorn
gunicorn taskmanager.wsgi:application
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou sugestões:
- Consulte a documentação da API
- Verifique os issues do GitHub
- Use a interface browsable do DRF
- Acesse o Django Admin para gerenciamento

---

**TaskManager** - Organize suas tarefas de forma inteligente e eficiente! 🚀

## 📊 Status do Projeto

### ✅ Implementado
- [x] Modelos de dados completos (6 modelos)
- [x] API REST completa com DRF
- [x] Sistema de autenticação por token
- [x] Filtros e busca avançados
- [x] Interface administrativa completa
- [x] Documentação abrangente
- [x] Validações e regras de negócio
- [x] Otimizações de performance
- [x] Testes e validação

### 🎯 Funcionalidades Principais
- **Tarefas**: CRUD completo com subtarefas
- **Listas**: Organização flexível
- **Categorias**: Classificação por contexto
- **Etiquetas**: Marcação personalizada
- **Histórico**: Rastreamento de conclusões
- **Filtros**: Busca por múltiplos critérios
- **Estatísticas**: Contadores e porcentagens
- **Admin**: Interface de gerenciamento

### 🔧 Tecnicamente Robusto
- **Arquitetura modular**: Aplicações separadas
- **Relacionamentos otimizados**: ForeignKey e ManyToMany
- **Índices de performance**: Para consultas frequentes
- **Validações customizadas**: Regras de negócio
- **Serializers completos**: Campos calculados
- **ViewSets avançados**: Ações customizadas
- **Permissões granulares**: Isolamento por usuário

