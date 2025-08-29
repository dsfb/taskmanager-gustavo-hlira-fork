import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, Calendar, Tag, List, User, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../lib/axios'
import SubtaskList from './SubtaskList'
import CreateSubtaskModal from './CreateSubtaskModal'

const TaskDetailsModal = ({ open, onOpenChange, task, onEdit, onDelete }) => {
  const [createSubtaskModalOpen, setCreateSubtaskModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch subtasks
  const { data: subtasks = [] } = useQuery({
    queryKey: ['subtasks', task?.id],
    queryFn: () => api.get(`/tasks/${task.id}/subtasks/`).then(res => res.data.results || res.data),
    enabled: !!task?.id
  })

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

  if (!task) return null

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
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatDuration = (duration) => {
    if (!duration) return null
    const [hours, minutes] = duration.split(':')
    return `${hours}h ${minutes}min`
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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
                <div className="flex-1">
                  <DialogTitle className={`text-xl ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </DialogTitle>
                  <DialogDescription>
                    Detalhes da tarefa
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center space-x-2">
              <Badge variant={task.completed ? "default" : "secondary"} className={task.completed ? "bg-green-600" : ""}>
                {task.completed ? 'Concluída' : 'Pendente'}
              </Badge>
              <Badge variant="outline">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`}></div>
                {getPriorityLabel(task.priority)}
              </Badge>
              {isOverdue(task.due_date) && !task.completed && (
                <Badge variant="destructive">
                  Atrasada
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.due_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Data limite: {formatDate(task.due_date)}</span>
                  </div>
                )}
                
                {task.reminder && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Lembrete: {formatDate(task.reminder)}</span>
                  </div>
                )}

                {task.estimated_duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Duração estimada: {formatDuration(task.estimated_duration)}</span>
                  </div>
                )}

                {task.category_name && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Categoria: {task.category_name}</span>
                  </div>
                )}

                {task.task_list_name && (
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Lista: {task.task_list_name}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Criada em: {formatDate(task.created_at)}</span>
                </div>

                {task.updated_at !== task.created_at && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Atualizada em: {formatDate(task.updated_at)}</span>
                  </div>
                )}

                {task.completed_at && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Concluída em: {formatDate(task.completed_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {task.tags_names && task.tags_names.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Etiquetas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.tags_names.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subtasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Subtarefas ({task.completed_subtasks_count || 0}/{task.subtasks_count || 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateSubtaskModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Subtarefa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {subtasks.length > 0 ? (
                  <SubtaskList subtasks={subtasks} taskId={task.id} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma subtarefa criada ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <CreateSubtaskModal
        open={createSubtaskModalOpen}
        onOpenChange={setCreateSubtaskModalOpen}
        taskId={task?.id}
      />
    </>
  )
}

export default TaskDetailsModal

