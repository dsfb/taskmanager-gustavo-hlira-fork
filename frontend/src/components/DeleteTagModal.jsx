import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import api from '../lib/axios'

const DeleteTagModal = ({ open, onOpenChange, tag }) => {
  const queryClient = useQueryClient()

  const deleteTagMutation = useMutation({
    mutationFn: (tagId) => api.delete(`/tags/${tagId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this tag
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting tag:', error)
    }
  })

  const handleDelete = () => {
    if (tag?.id) {
      deleteTagMutation.mutate(tag.id)
    }
  }

  if (!tag) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Excluir Etiqueta</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. A etiqueta será excluída permanentemente e removida de todas as tarefas associadas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: tag.color }}
              ></div>
              <div>
                <p className="font-medium text-sm">{tag.name}</p>
                {tag.tasks_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta etiqueta está sendo usada em {tag.tasks_count} tarefa(s).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={deleteTagMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteTagMutation.isPending}
          >
            {deleteTagMutation.isPending ? 'Excluindo...' : 'Excluir Etiqueta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTagModal

