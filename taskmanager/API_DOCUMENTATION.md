# Documentação da API - TaskManager

## Visão Geral

A API do TaskManager é uma API REST completa desenvolvida com Django REST Framework que permite gerenciar tarefas, listas, categorias e etiquetas de forma organizada e eficiente.

## Autenticação

A API utiliza autenticação por token. Após o login, inclua o token no header das requisições:

```
Authorization: Token seu_token_aqui
```

## Endpoints de Autenticação

### POST /api/auth/register/
Registra um novo usuário.

**Payload:**
```json
{
    "username": "usuario",
    "email": "usuario@email.com",
    "password": "senha123",
    "password_confirm": "senha123",
    "first_name": "Nome",
    "last_name": "Sobrenome"
}
```

**Resposta:**
```json
{
    "message": "Usuário criado com sucesso",
    "user": {
        "id": 1,
        "username": "usuario",
        "email": "usuario@email.com",
        "first_name": "Nome",
        "last_name": "Sobrenome",
        "tasks_count": 0,
        "completed_tasks_count": 0,
        "categories_count": 0,
        "tags_count": 0,
        "lists_count": 0
    },
    "token": "abc123..."
}
```

### POST /api/auth/login/
Realiza login do usuário.

**Payload:**
```json
{
    "username": "usuario",
    "password": "senha123"
}
```

**Resposta:**
```json
{
    "message": "Login realizado com sucesso",
    "user": { ... },
    "token": "abc123..."
}
```

### POST /api/auth/logout/
Realiza logout do usuário (requer autenticação).

**Resposta:**
```json
{
    "message": "Logout realizado com sucesso"
}
```

### GET /api/auth/user/
Retorna dados do usuário atual (requer autenticação).

### PUT /api/auth/user/
Atualiza dados do usuário atual (requer autenticação).

## Endpoints de Tarefas

### GET /api/tasks/
Lista todas as tarefas do usuário.

**Parâmetros de filtro:**
- `completed`: true/false
- `priority`: low/medium/high
- `category`: ID da categoria
- `task_list`: ID da lista
- `search`: busca por título/descrição
- `ordering`: created_at, due_date, priority, title

**Exemplo:** `/api/tasks/?completed=false&priority=high&search=reunião`

### POST /api/tasks/
Cria uma nova tarefa.

**Payload:**
```json
{
    "title": "Implementar API",
    "description": "Desenvolver endpoints REST",
    "due_date": "2024-12-31T23:59:59Z",
    "priority": "high",
    "reminder": "2024-12-30T09:00:00Z",
    "estimated_duration": "02:00:00",
    "task_list": 1,
    "category": 1,
    "tags": [1, 2]
}
```

### GET /api/tasks/{id}/
Retorna detalhes de uma tarefa específica.

### PUT /api/tasks/{id}/
Atualiza uma tarefa específica.

### DELETE /api/tasks/{id}/
Exclui uma tarefa específica.

### POST /api/tasks/{id}/complete/
Marca uma tarefa como concluída.

**Payload opcional:**
```json
{
    "notes": "Tarefa concluída com sucesso"
}
```

### POST /api/tasks/{id}/uncomplete/
Desmarca uma tarefa como concluída.

### GET /api/tasks/overdue/
Lista tarefas atrasadas.

### GET /api/tasks/today/
Lista tarefas para hoje.

## Endpoints de Subtarefas

### GET /api/tasks/{task_id}/subtasks/
Lista subtarefas de uma tarefa.

### POST /api/tasks/{task_id}/subtasks/
Cria uma nova subtarefa.

**Payload:**
```json
{
    "title": "Configurar banco de dados",
    "order": 1
}
```

### GET /api/subtasks/{id}/
Retorna detalhes de uma subtarefa.

### PUT /api/subtasks/{id}/
Atualiza uma subtarefa.

### DELETE /api/subtasks/{id}/
Exclui uma subtarefa.

## Endpoints de Listas

### GET /api/lists/
Lista todas as listas do usuário.

### POST /api/lists/
Cria uma nova lista.

**Payload:**
```json
{
    "name": "Projeto TaskManager",
    "description": "Desenvolvimento do sistema",
    "custom_profile": true,
    "auto_suggestion": false
}
```

### GET /api/lists/{id}/
Retorna detalhes de uma lista.

### PUT /api/lists/{id}/
Atualiza uma lista.

### DELETE /api/lists/{id}/
Exclui uma lista.

### GET /api/lists/{id}/tasks/
Lista tarefas de uma lista específica.

## Endpoints de Categorias

### GET /api/categories/
Lista todas as categorias do usuário.

### POST /api/categories/
Cria uma nova categoria.

**Payload:**
```json
{
    "name": "Trabalho",
    "description": "Tarefas relacionadas ao trabalho",
    "color": "#007bff"
}
```

### GET /api/categories/{id}/
Retorna detalhes de uma categoria.

### PUT /api/categories/{id}/
Atualiza uma categoria.

### DELETE /api/categories/{id}/
Exclui uma categoria.

## Endpoints de Etiquetas

### GET /api/tags/
Lista todas as etiquetas do usuário.

### POST /api/tags/
Cria uma nova etiqueta.

**Payload:**
```json
{
    "name": "Urgente",
    "color": "#dc3545"
}
```

### GET /api/tags/{id}/
Retorna detalhes de uma etiqueta.

### PUT /api/tags/{id}/
Atualiza uma etiqueta.

### DELETE /api/tags/{id}/
Exclui uma etiqueta.

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Exemplos de Uso

### Criar uma tarefa completa

```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Token seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revisar código",
    "description": "Revisar pull request #123",
    "due_date": "2024-12-31T17:00:00Z",
    "priority": "medium",
    "category": 1,
    "tags": [1, 2]
  }'
```

### Filtrar tarefas

```bash
# Tarefas pendentes de alta prioridade
curl "http://localhost:8000/api/tasks/?completed=false&priority=high" \
  -H "Authorization: Token seu_token"

# Buscar tarefas por texto
curl "http://localhost:8000/api/tasks/?search=reunião" \
  -H "Authorization: Token seu_token"

# Tarefas ordenadas por data limite
curl "http://localhost:8000/api/tasks/?ordering=due_date" \
  -H "Authorization: Token seu_token"
```

### Marcar tarefa como concluída

```bash
curl -X POST http://localhost:8000/api/tasks/1/complete/ \
  -H "Authorization: Token seu_token" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Concluída antes do prazo"}'
```

## Estrutura de Resposta das Tarefas

```json
{
    "id": 1,
    "title": "Implementar API",
    "description": "Desenvolver endpoints REST",
    "due_date": "2024-12-31T23:59:59Z",
    "completed": false,
    "priority": "high",
    "reminder": "2024-12-30T09:00:00Z",
    "estimated_duration": "02:00:00",
    "task_list": 1,
    "category": 1,
    "tags": [1, 2],
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "completed_at": null,
    "subtasks": [
        {
            "id": 1,
            "title": "Configurar banco",
            "completed": true,
            "order": 1,
            "created_at": "2024-01-01T10:05:00Z"
        }
    ],
    "history": null,
    "category_name": "Trabalho",
    "task_list_name": "Projeto TaskManager",
    "tags_names": ["Urgente", "Backend"],
    "is_overdue": false,
    "days_until_due": 30,
    "priority_color": "#dc3545",
    "subtasks_count": 1,
    "completed_subtasks_count": 1,
    "subtasks_completion_percentage": 100.0,
    "can_be_completed": true
}
```

## Paginação

A API utiliza paginação automática com 20 itens por página. A resposta inclui:

```json
{
    "count": 100,
    "next": "http://localhost:8000/api/tasks/?page=2",
    "previous": null,
    "results": [...]
}
```

## Tratamento de Erros

### Erro de validação (400)
```json
{
    "title": ["Este campo é obrigatório."],
    "due_date": ["Data deve ser no futuro."]
}
```

### Erro de autenticação (401)
```json
{
    "detail": "Token inválido."
}
```

### Erro de permissão (403)
```json
{
    "detail": "Você não tem permissão para executar essa ação."
}
```

### Recurso não encontrado (404)
```json
{
    "detail": "Não encontrado."
}
```

## Considerações de Performance

1. **Paginação**: Todas as listagens são paginadas
2. **Filtros**: Use filtros para reduzir o volume de dados
3. **Campos**: A listagem de tarefas retorna campos resumidos
4. **Cache**: Considere implementar cache no frontend
5. **Batch**: Para operações em lote, faça múltiplas requisições

## Limites e Restrições

- **Rate Limiting**: Não implementado (considere para produção)
- **Tamanho de arquivo**: Não aplicável (API apenas)
- **Campos de texto**: Títulos limitados a 200 caracteres
- **Relacionamentos**: Validação de propriedade por usuário
- **Nomes únicos**: Categorias, tags e listas por usuário

## Versionamento

Versão atual: **v1**

A API é versionada através da URL base. Mudanças breaking serão introduzidas em novas versões.

## Suporte

Para dúvidas sobre a API, consulte:
- Esta documentação
- Código fonte dos serializers
- Interface browsable do DRF em `/api/`
- Django Admin em `/admin/`

