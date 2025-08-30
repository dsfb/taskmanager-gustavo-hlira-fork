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
  GripVertical,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import DeleteTaskModal from '../components/DeleteTaskModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import api from '../lib/axios'

const ListDetailPage = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false)
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false)
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const queryClient = useQueryClient()

  // Fetch list details
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ['lists', listId],
    queryFn: () => api.get(`/lists/${listId}/`).then(res => res.data),
    enabled: !!listId
  })

  // Fetch tasks for this list
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'list', listId],
    queryFn: () => api.get(`/tasks/?task_list=${listId}`).then(res => res.data.results || res.data),
    enabled: !!listId
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
      queryClient.invalidateQueries(['lists'])
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

  // Reorder tasks (simple reorder without drag & drop for now)
  const reorderTasksMutation = useMutation({
    mutationFn: async (reorderedTasks) => {
      // Update order for each task
      const promises = reorderedTasks.map((task, index) => 
        api.put(`/tasks/${task.id}/`, { ...task, order: index })
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    }
  })

  // Fetch all lists for move functionality
  const { data: allLists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists/').then(res => res.data.results || res.data)
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
      
      return matchesSearch && matchesStatus && matchesPriority
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

  if (listLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando lista...</p>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold">Lista não encontrada</p>
          <Button onClick={() => navigate('/app/lists')} className="mt-4">
            Voltar para Listas
          </Button>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/lists')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            {list.description && (
              <p className="text-muted-foreground">{list.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total de Tarefas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalTasks - completedTasks}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Progresso</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                {tasks.length === 0 ? 'Nenhuma tarefa nesta lista ainda.' : 'Nenhuma tarefa encontrada com os filtros aplicados.'}
              </p>
              <Button onClick={handleCreateTask} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTasks.map((task, index) => (
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
                        {task.category_name && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{task.category_name}</span>
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
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {allLists.filter(l => l.id !== parseInt(listId)).map(targetList => (
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

      {/* Modals */}
      <CreateTaskModal
        open={createTaskModalOpen}
        onOpenChange={setCreateTaskModalOpen}
        defaultListId={parseInt(listId)}
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

export default ListDetailPage

