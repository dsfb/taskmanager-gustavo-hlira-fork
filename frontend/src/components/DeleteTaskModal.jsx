import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import api from '../lib/axios'

const DeleteTaskModal = ({ open, onOpenChange, task }) => {
  const queryClient = useQueryClient()

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting task:', error)
    }
  })

  const handleDelete = () => {
    if (task?.id) {
      deleteTaskMutation.mutate(task.id)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Excluir Tarefa</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. A tarefa e todas as suas subtarefas serão excluídas permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium text-sm">{task.title}</p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description.length > 100 
                  ? `${task.description.substring(0, 100)}...` 
                  : task.description
                }
              </p>
            )}
            {task.subtasks_count > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Esta tarefa possui {task.subtasks_count} subtarefa(s) que também serão excluídas.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={deleteTaskMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? 'Excluindo...' : 'Excluir Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTaskModal

