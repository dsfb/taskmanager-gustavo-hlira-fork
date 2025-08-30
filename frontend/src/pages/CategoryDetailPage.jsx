import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  MoreHorizontal, 
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  List,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import DeleteTaskModal from '../components/DeleteTaskModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import api from '../lib/axios'

const CategoryDetailPage = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false)
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false)
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterList, setFilterList] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [activeTab, setActiveTab] = useState('tasks')

  const queryClient = useQueryClient()

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => api.get(`/categories/${categoryId}/`).then(res => res.data),
    enabled: !!categoryId
  })

  // Fetch tasks for this category
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'category', categoryId],
    queryFn: () => api.get(`/tasks/?category=${categoryId}`).then(res => res.data.results || res.data),
    enabled: !!categoryId
  })

  // Fetch all lists for filtering
  const { data: allLists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists/').then(res => res.data.results || res.data)
  })

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      if (completed) {
        return api.post(`/tasks/${taskId}/uncomplete/`)
      } else {
        return api.post(`/tasks/${taskId}/complete/`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['categories'])
    }
  })

  // Move task to different list
  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, newListId }) => 
      api.put(`/tasks/${taskId}/`, { task_list: newListId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['lists'])
    }
  })

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && task.completed) ||
                           (filterStatus === 'pending' && !task.completed)
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      const matchesList = filterList === 'all' || 
                         (filterList === 'none' && !task.task_list) ||
                         task.task_list === parseInt(filterList)
      
      return matchesSearch && matchesStatus && matchesPriority && matchesList
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date) : new Date('9999-12-31')
          bValue = b.due_date ? new Date(b.due_date) : new Date('9999-12-31')
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority] || 0
          bValue = priorityOrder[b.priority] || 0
          break
        case 'created_at':
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    overdue: tasks.filter(task => !task.completed && task.due_date && new Date(task.due_date) < new Date()).length,
    highPriority: tasks.filter(task => task.priority === 'high').length,
    mediumPriority: tasks.filter(task => task.priority === 'medium').length,
    lowPriority: tasks.filter(task => task.priority === 'low').length,
    withLists: tasks.filter(task => task.task_list).length,
    withoutLists: tasks.filter(task => !task.task_list).length
  }

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  // Group tasks by list
  const tasksByList = tasks.reduce((acc, task) => {
    const listName = task.task_list_name || 'Sem Lista'
    if (!acc[listName]) {
      acc[listName] = []
    }
    acc[listName].push(task)
    return acc
  }, {})

  const handleCreateTask = () => {
    setCreateTaskModalOpen(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setEditTaskModalOpen(true)
  }

  const handleDeleteTask = (task) => {
    setSelectedTask(task)
    setDeleteTaskModalOpen(true)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setTaskDetailsModalOpen(true)
  }

  const handleToggleTask = (task) => {
    toggleTaskMutation.mutate({ taskId: task.id, completed: task.completed })
  }

  const handleMoveTask = (task, newListId) => {
    moveTaskMutation.mutate({ taskId: task.id, newListId })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando categoria...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold">Categoria não encontrada</p>
          <Button onClick={() => navigate('/app/categories')} className="mt-4">
            Voltar para Categorias
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/categories')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: category.color || '#6b7280' }}
              ></div>
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Categoria</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
          <TabsTrigger value="lists">Por Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterList} onValueChange={setFilterList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Listas</SelectItem>
                    <SelectItem value="none">Sem Lista</SelectItem>
                    {allLists.map(list => (
                      <SelectItem key={list.id} value={list.id.toString()}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Data de Criação</SelectItem>
                    <SelectItem value="due_date">Data Limite</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Tarefas ({filteredAndSortedTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredAndSortedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {tasks.length === 0 ? 'Nenhuma tarefa nesta categoria ainda.' : 'Nenhuma tarefa encontrada com os filtros aplicados.'}
                  </p>
                  <Button onClick={handleCreateTask} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Tarefa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 ${task.completed ? 'bg-muted/50' : 'bg-background'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-5 w-5"
                          onClick={() => handleToggleTask(task)}
                        >
                          <CheckCircle 
                            className={`w-4 h-4 ${
                              task.completed 
                                ? 'text-green-600 fill-green-100' 
                                : 'text-muted-foreground hover:text-green-600'
                            }`} 
                          />
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 
                              className={`font-medium cursor-pointer hover:text-primary ${
                                task.completed ? 'line-through text-muted-foreground' : ''
                              }`}
                              onClick={() => handleViewTask(task)}
                            >
                              {task.title}
                            </h3>
                            <Badge variant="outline">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`}></div>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            {task.task_list_name && (
                              <Badge variant="secondary">
                                <List className="w-3 h-3 mr-1" />
                                {task.task_list_name}
                              </Badge>
                            )}
                            {isOverdue(task.due_date) && !task.completed && (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Atrasada
                              </Badge>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(task.due_date)}</span>
                              </div>
                            )}
                            {task.subtasks_count > 0 && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>{task.completed_subtasks_count}/{task.subtasks_count}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTask(task)}>
                              <Tag className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {allLists.map(targetList => (
                              <DropdownMenuItem 
                                key={targetList.id}
                                onClick={() => handleMoveTask(task, targetList.id)}
                              >
                                Mover para "{targetList.name}"
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Alta</span>
                    </div>
                    <span className="text-sm font-medium">{stats.highPriority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Média</span>
                    </div>
                    <span className="text-sm font-medium">{stats.mediumPriority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Baixa</span>
                    </div>
                    <span className="text-sm font-medium">{stats.lowPriority}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* List Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Lista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Com Lista</span>
                    <span className="text-sm font-medium">{stats.withLists}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sem Lista</span>
                    <span className="text-sm font-medium">{stats.withoutLists}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          {Object.entries(tasksByList).map(([listName, listTasks]) => (
            <Card key={listName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{listName}</span>
                  <Badge variant="outline">{listTasks.length} tarefas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {listTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <CheckCircle 
                          className={`w-4 h-4 ${
                            task.completed 
                              ? 'text-green-600 fill-green-100' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                        <Badge variant="outline" size="sm">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-1`}></div>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTask(task)}
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTaskModal
        open={createTaskModalOpen}
        onOpenChange={setCreateTaskModalOpen}
        defaultCategoryId={parseInt(categoryId)}
      />

      <EditTaskModal
        open={editTaskModalOpen}
        onOpenChange={setEditTaskModalOpen}
        task={selectedTask}
      />

      <DeleteTaskModal
        open={deleteTaskModalOpen}
        onOpenChange={setDeleteTaskModalOpen}
        task={selectedTask}
      />

      <TaskDetailsModal
        open={taskDetailsModalOpen}
        onOpenChange={setTaskDetailsModalOpen}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}

export default CategoryDetailPage

