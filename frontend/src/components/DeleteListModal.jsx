import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import api from '../lib/axios'

const DeleteListModal = ({ open, onOpenChange, list }) => {
  const queryClient = useQueryClient()

  const deleteListMutation = useMutation({
    mutationFn: (listId) => api.delete(`/lists/${listId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this list
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting list:', error)
    }
  })

  const handleDelete = () => {
    if (list?.id) {
      deleteListMutation.mutate(list.id)
    }
  }

  if (!list) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Excluir Lista</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. A lista será excluída permanentemente e removida de todas as tarefas associadas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium text-sm">{list.name}</p>
            {list.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {list.description.length > 100 
                  ? `${list.description.substring(0, 100)}...` 
                  : list.description
                }
              </p>
            )}
            {list.tasks_count > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Esta lista contém {list.tasks_count} tarefa(s).
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              {list.custom_profile && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Perfil Personalizado
                </span>
              )}
              {list.auto_suggestion && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Sugestão Automática
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={deleteListMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteListMutation.isPending}
          >
            {deleteListMutation.isPending ? 'Excluindo...' : 'Excluir Lista'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteListModal

