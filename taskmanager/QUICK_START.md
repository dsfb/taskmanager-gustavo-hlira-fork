# Guia de Início Rápido - TaskManager

## 🚀 Executar o Sistema

1. **Instalar dependências**
   ```bash
   pip install -r requirements.txt
   ```

2. **Executar migrações**
   ```bash
   python manage.py migrate
   ```

3. **Criar superusuário (opcional)**
   ```bash
   python manage.py createsuperuser
   ```

4. **Iniciar servidor**
   ```bash
   python manage.py runserver
   ```

## 🌐 Acessar o Sistema

- **API Root**: http://localhost:8000/
- **Admin**: http://localhost:8000/admin/
- **API Browsable**: http://localhost:8000/api/

## 👤 Usuários de Teste

- **Admin**: `admin` / `admin123`
- **Usuário**: `testuser` / `testpass123`

## 🔧 Primeiros Passos na API

### 1. Registrar usuário
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "meuusuario",
    "email": "meu@email.com",
    "password": "minhasenha123",
    "password_confirm": "minhasenha123"
  }'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "meuusuario",
    "password": "minhasenha123"
  }'
```

### 3. Criar categoria
```bash
curl -X POST http://localhost:8000/api/categories/ \
  -H "Authorization: Token SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trabalho",
    "description": "Tarefas do trabalho",
    "color": "#007bff"
  }'
```

### 4. Criar tarefa
```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Token SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Minha primeira tarefa",
    "description": "Descrição da tarefa",
    "priority": "medium",
    "category": 1
  }'
```

### 5. Listar tarefas
```bash
curl http://localhost:8000/api/tasks/ \
  -H "Authorization: Token SEU_TOKEN"
```

## 📱 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register/` | Registrar usuário |
| POST | `/api/auth/login/` | Login |
| GET | `/api/tasks/` | Listar tarefas |
| POST | `/api/tasks/` | Criar tarefa |
| GET | `/api/tasks/{id}/` | Detalhes da tarefa |
| POST | `/api/tasks/{id}/complete/` | Marcar como concluída |
| GET | `/api/categories/` | Listar categorias |
| GET | `/api/tags/` | Listar etiquetas |
| GET | `/api/lists/` | Listar listas |

## 🔍 Filtros Úteis

```bash
# Tarefas pendentes
GET /api/tasks/?completed=false

# Tarefas de alta prioridade
GET /api/tasks/?priority=high

# Buscar por texto
GET /api/tasks/?search=reunião

# Tarefas atrasadas
GET /api/tasks/overdue/

# Tarefas para hoje
GET /api/tasks/today/
```

## 🎛️ Interface Admin

1. Acesse: http://localhost:8000/admin/
2. Login: `admin` / `admin123`
3. Gerencie todos os dados através da interface visual

## 📚 Documentação Completa

- **README.md**: Documentação principal
- **API_DOCUMENTATION.md**: Documentação completa da API
- **MODELS_DOCUMENTATION.md**: Estrutura de dados

## 🆘 Problemas Comuns

### Erro de migração
```bash
python manage.py migrate --run-syncdb
```

### Erro de dependências
```bash
pip install --upgrade -r requirements.txt
```

### Erro de token
Certifique-se de incluir o header:
```
Authorization: Token seu_token_aqui
```

## 🚀 Próximos Passos

1. **Frontend**: Desenvolver interface React/Vue/Angular
2. **Mobile**: Criar app móvel consumindo a API
3. **Deploy**: Configurar para produção
4. **Extensões**: Adicionar notificações, relatórios, etc.

---

**TaskManager está pronto para uso!** 🎉

