# Documentação dos Modelos - TaskManager

## Visão Geral

O sistema TaskManager utiliza 6 modelos principais para gerenciar tarefas, organizados de forma modular e flexível. Todos os modelos são associados ao usuário proprietário, garantindo isolamento de dados.

## Modelos Implementados

### 1. Category (Categoria)
**Localização:** `categories/models.py`

Permite classificar tarefas por contexto geral (ex: Trabalho, Estudos, Pessoal).

**Campos:**
- `name` (CharField, 50 chars) - Nome da categoria
- `description` (TextField, opcional) - Descrição da categoria
- `color` (CharField, 7 chars) - Cor em formato hexadecimal (#RRGGBB)
- `user` (ForeignKey) - Usuário proprietário
- `created_at` / `updated_at` - Timestamps automáticos

**Relacionamentos:**
- `user` → User (N:1)
- `tasks` ← Task (1:N)

**Métodos Principais:**
- `get_tasks_count()` - Número de tarefas na categoria
- `get_completed_tasks_count()` - Tarefas concluídas
- `get_completion_percentage()` - Porcentagem de conclusão

**Restrições:**
- Nome único por usuário
- Cor deve estar no formato hexadecimal válido

---

### 2. Tag (Etiqueta)
**Localização:** `tags/models.py`

Permite marcação personalizada das tarefas (ex: Urgente, Reunião, Cliente).

**Campos:**
- `name` (CharField, 30 chars) - Nome da etiqueta
- `color` (CharField, 7 chars) - Cor em formato hexadecimal
- `user` (ForeignKey) - Usuário proprietário
- `created_at` / `updated_at` - Timestamps automáticos

**Relacionamentos:**
- `user` → User (N:1)
- `tasks` ← Task (N:N através de ManyToMany)

**Métodos Principais:**
- `get_tasks_count()` - Número de tarefas com esta etiqueta
- `get_completed_tasks_count()` - Tarefas concluídas com esta etiqueta
- `get_completion_percentage()` - Porcentagem de conclusão

**Restrições:**
- Nome único por usuário
- Cor deve estar no formato hexadecimal válido

---

### 3. TaskList (Lista de Tarefas)
**Localização:** `lists/models.py`

Permite agrupar tarefas por contexto, projeto ou qualquer critério definido pelo usuário.

**Campos:**
- `name` (CharField, 100 chars) - Nome da lista
- `description` (TextField, opcional) - Descrição da lista
- `custom_profile` (BooleanField) - Indica configurações personalizadas
- `auto_suggestion` (BooleanField) - Permite sugestões automáticas
- `user` (ForeignKey) - Usuário proprietário
- `created_at` / `updated_at` - Timestamps automáticos

**Relacionamentos:**
- `user` → User (N:1)
- `tasks` ← Task (1:N)

**Métodos Principais:**
- `get_tasks_count()` - Total de tarefas na lista
- `get_completed_tasks_count()` - Tarefas concluídas
- `get_pending_tasks_count()` - Tarefas pendentes
- `get_completion_percentage()` - Porcentagem de conclusão
- `get_overdue_tasks_count()` - Tarefas atrasadas
- `get_high_priority_tasks_count()` - Tarefas de alta prioridade

**Restrições:**
- Nome único por usuário

---

### 4. Task (Tarefa)
**Localização:** `tasks/models.py`

Modelo principal para tarefas. Pode existir independentemente ou estar associada a uma lista.

**Campos:**
- `title` (CharField, 200 chars) - Título da tarefa
- `description` (TextField, opcional) - Descrição detalhada
- `due_date` (DateTimeField, opcional) - Data limite
- `completed` (BooleanField) - Status de conclusão
- `priority` (CharField) - Prioridade: low, medium, high
- `reminder` (DateTimeField, opcional) - Data/hora do lembrete
- `estimated_duration` (DurationField, opcional) - Duração estimada
- `user` (ForeignKey) - Usuário proprietário
- `task_list` (ForeignKey, opcional) - Lista associada
- `category` (ForeignKey, opcional) - Categoria
- `tags` (ManyToManyField) - Etiquetas
- `created_at` / `updated_at` / `completed_at` - Timestamps

**Relacionamentos:**
- `user` → User (N:1)
- `task_list` → TaskList (N:1, opcional)
- `category` → Category (N:1, opcional)
- `tags` → Tag (N:N)
- `subtasks` ← Subtask (1:N)
- `history` ← TaskHistory (1:1)

**Métodos Principais:**
- `is_overdue()` - Verifica se está atrasada
- `days_until_due()` - Dias até vencimento
- `get_priority_display_color()` - Cor da prioridade
- `get_subtasks_count()` - Número de subtarefas
- `get_completed_subtasks_count()` - Subtarefas concluídas
- `get_subtasks_completion_percentage()` - Porcentagem subtarefas
- `can_be_completed()` - Verifica se pode ser concluída

**Funcionalidades Especiais:**
- Auto-gerenciamento do campo `completed_at`
- Índices otimizados para consultas frequentes
- Validação de regras de negócio

**Escolhas de Prioridade:**
- `low` - Baixa (#28a745 - Verde)
- `medium` - Média (#ffc107 - Amarelo)
- `high` - Alta (#dc3545 - Vermelho)

---

### 5. Subtask (Subtarefa)
**Localização:** `tasks/models.py`

Cada subtarefa pertence a uma tarefa principal, permitindo decomposição de tarefas complexas.

**Campos:**
- `title` (CharField, 200 chars) - Título da subtarefa
- `completed` (BooleanField) - Status de conclusão
- `order` (PositiveIntegerField) - Ordem de exibição
- `task` (ForeignKey) - Tarefa principal
- `created_at` / `updated_at` / `completed_at` - Timestamps

**Relacionamentos:**
- `task` → Task (N:1)

**Funcionalidades Especiais:**
- Auto-gerenciamento do campo `completed_at`
- Ordenação por campo `order` e `created_at`

---

### 6. TaskHistory (Histórico de Tarefa)
**Localização:** `tasks/models.py`

Armazena informações sobre a conclusão da tarefa para análise e relatórios.

**Campos:**
- `completion_date` (DateTimeField) - Data de conclusão
- `estimated_duration` (DurationField, opcional) - Duração estimada original
- `actual_duration` (DurationField, opcional) - Duração real gasta
- `notes` (TextField, opcional) - Observações sobre a conclusão
- `task` (OneToOneField) - Tarefa relacionada

**Relacionamentos:**
- `task` → Task (1:1)

**Métodos Principais:**
- `get_duration_difference()` - Diferença entre estimado e real
- `was_completed_on_time()` - Se foi concluída no prazo

---

## Relacionamentos Entre Modelos

```
User (Django)
├── Category (1:N)
├── Tag (1:N)
├── TaskList (1:N)
└── Task (1:N)
    ├── Subtask (1:N)
    ├── TaskHistory (1:1)
    ├── Category (N:1, opcional)
    ├── TaskList (N:1, opcional)
    └── Tag (N:N)
```

## Índices de Performance

O modelo Task possui índices otimizados para consultas frequentes:
- `(user, completed)` - Filtrar tarefas por status
- `(user, due_date)` - Ordenar por data limite
- `(user, priority)` - Filtrar por prioridade

## Regras de Negócio Implementadas

### Validações
1. **Cores**: Devem estar no formato hexadecimal (#RRGGBB)
2. **Nomes únicos**: Categorias, tags e listas têm nomes únicos por usuário
3. **Relacionamentos opcionais**: Tarefas podem existir sem lista ou categoria
4. **Subtarefas obrigatórias**: Para conclusão de tarefa com subtarefas

### Comportamentos Automáticos
1. **Timestamps**: `completed_at` é gerenciado automaticamente
2. **Cascata**: Exclusão de usuário remove todos os dados relacionados
3. **SET_NULL**: Exclusão de lista/categoria não afeta tarefas
4. **Ordenação**: Modelos têm ordenação padrão definida

### Métodos de Conveniência
Todos os modelos possuem métodos para:
- Contagem de itens relacionados
- Cálculo de porcentagens de conclusão
- Formatação de dados para exibição
- Validação de regras de negócio

## Migrações

As migrações foram criadas e aplicadas com sucesso:
- `categories/migrations/0001_initial.py`
- `lists/migrations/0001_initial.py`
- `tags/migrations/0001_initial.py`
- `tasks/migrations/0001_initial.py`

## Testes Realizados

✅ Criação de objetos em todos os modelos  
✅ Relacionamentos entre modelos  
✅ Métodos de contagem e cálculo  
✅ Validações de campos  
✅ Comportamentos automáticos  

## Próximos Passos

1. Implementar serializers do DRF
2. Criar views e viewsets
3. Configurar autenticação e permissões
4. Implementar filtros avançados
5. Adicionar validações customizadas

