import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import TaskDetailsModal from '../components/TaskDetailsModal'
import DeleteTaskModal from '../components/DeleteTaskModal'
import api from '../lib/axios'

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const queryClient = useQueryClient()

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', searchTerm, priorityFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (statusFilter !== 'all') params.append('completed', statusFilter === 'completed')
      
      return api.get(`/tasks/?${params.toString()}`).then(res => res.data)
    }
  })

  const tasks = tasksData?.results || tasksData || []

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
    }
  })

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
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setEditModalOpen(true)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setDetailsModalOpen(true)
  }

  const handleDeleteTask = (task) => {
    setSelectedTask(task)
    setDeleteModalOpen(true)
  }

  const TaskCard = ({ task }) => (
    <Card className={`transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 mt-1"
              onClick={() => toggleTaskMutation.mutate({ 
                taskId: task.id, 
                completed: task.completed 
              })}
            >
              <CheckCircle 
                className={`w-5 h-5 ${
                  task.completed 
                    ? 'text-green-600 fill-green-100' 
                    : 'text-muted-foreground hover:text-green-600'
                }`} 
              />
            </Button>
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1">
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description
                  }
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewTask(task)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteTask(task)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {getPriorityLabel(task.priority)}
            </Badge>
            {task.category_name && (
              <Badge variant="outline">
                {task.category_name}
              </Badge>
            )}
            {task.completed && (
              <Badge variant="default" className="bg-green-600">
                Concluída
              </Badge>
            )}
            {isOverdue(task.due_date) && !task.completed && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Atrasada
              </Badge>
            )}
          </div>
          {task.due_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
        
        {task.tags_names && task.tags_names.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags_names.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {task.subtasks_count > 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            Subtarefas: {task.completed_subtasks_count}/{task.subtasks_count} concluídas
            {task.subtasks_completion_percentage && (
              <span className="ml-2">({Math.round(task.subtasks_completion_percentage)}%)</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const pendingTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false
    const today = new Date()
    const taskDate = new Date(task.due_date)
    return taskDate.toDateString() === today.toDateString()
  })
  const overdueTasks = tasks.filter(task => isOverdue(task.due_date) && !task.completed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="high">Alta prioridade</SelectItem>
                <SelectItem value="medium">Média prioridade</SelectItem>
                <SelectItem value="low">Baixa prioridade</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Todas ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Hoje ({todayTasks.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Atrasadas ({overdueTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length > 0 ? (
            <div className="grid gap-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa pendente</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todayTasks.length > 0 ? (
            <div className="grid gap-4">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa para hoje</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueTasks.length > 0 ? (
            <div className="grid gap-4">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa atrasada</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa concluída</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTaskModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
      
      <EditTaskModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        task={selectedTask}
      />
      
      <TaskDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
      
      <DeleteTaskModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        task={selectedTask}
      />
    </div>
  )
}

export default TasksPage

