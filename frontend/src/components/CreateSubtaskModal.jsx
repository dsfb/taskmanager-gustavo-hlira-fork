import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '../lib/axios'

const CreateSubtaskModal = ({ open, onOpenChange, taskId }) => {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const createSubtaskMutation = useMutation({
    mutationFn: (subtaskData) => api.post(`/tasks/${taskId}/subtasks/`, subtaskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subtasks', taskId])
      queryClient.invalidateQueries(['tasks'])
      setTitle('')
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error creating subtask:', error)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    createSubtaskMutation.mutate({
      title: title.trim(),
      order: 1 // Default order
    })
  }

  const handleClose = () => {
    setTitle('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Subtarefa</DialogTitle>
          <DialogDescription>
            Adicione uma nova subtarefa para organizar melhor sua tarefa.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Subtarefa *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da subtarefa"
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createSubtaskMutation.isPending || !title.trim()}>
              {createSubtaskMutation.isPending ? 'Criando...' : 'Criar Subtarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSubtaskModal

