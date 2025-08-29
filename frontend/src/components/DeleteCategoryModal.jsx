import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import api from '../lib/axios'

const DeleteCategoryModal = ({ open, onOpenChange, category }) => {
  const queryClient = useQueryClient()

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => api.delete(`/categories/${categoryId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this category
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting category:', error)
    }
  })

  const handleDelete = () => {
    if (category?.id) {
      deleteCategoryMutation.mutate(category.id)
    }
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Excluir Categoria</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. A categoria será excluída permanentemente e removida de todas as tarefas associadas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color }}
              ></div>
              <div>
                <p className="font-medium text-sm">{category.name}</p>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description.length > 100 
                      ? `${category.description.substring(0, 100)}...` 
                      : category.description
                    }
                  </p>
                )}
                {category.tasks_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta categoria está sendo usada em {category.tasks_count} tarefa(s).
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
            disabled={deleteCategoryMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending}
          >
            {deleteCategoryMutation.isPending ? 'Excluindo...' : 'Excluir Categoria'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteCategoryModal

