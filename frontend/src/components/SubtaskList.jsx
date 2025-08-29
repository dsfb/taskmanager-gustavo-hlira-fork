import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Edit, Trash2, Save, X } from 'lucide-react'
import api from '../lib/axios'

const SubtaskList = ({ subtasks, taskId }) => {
  const [editingSubtask, setEditingSubtask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const queryClient = useQueryClient()

  const toggleSubtaskMutation = useMutation({
    mutationFn: async (subtask) => {
      // A API não tem endpoint específico para toggle, então vamos usar PUT
      return api.put(`/subtasks/${subtask.id}/`, {
        ...subtask,
        completed: !subtask.completed
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subtasks', taskId])
      queryClient.invalidateQueries(['tasks'])
    }
  })

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }) => api.put(`/subtasks/${subtaskId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subtasks', taskId])
      queryClient.invalidateQueries(['tasks'])
      setEditingSubtask(null)
      setEditTitle('')
    }
  })

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId) => api.delete(`/subtasks/${subtaskId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['subtasks', taskId])
      queryClient.invalidateQueries(['tasks'])
    }
  })

  const handleEdit = (subtask) => {
    setEditingSubtask(subtask.id)
    setEditTitle(subtask.title)
  }

  const handleSave = (subtask) => {
    if (editTitle.trim()) {
      updateSubtaskMutation.mutate({
        subtaskId: subtask.id,
        data: {
          ...subtask,
          title: editTitle.trim()
        }
      })
    }
  }

  const handleCancel = () => {
    setEditingSubtask(null)
    setEditTitle('')
  }

  const handleDelete = (subtaskId) => {
    if (window.confirm('Tem certeza que deseja excluir esta subtarefa?')) {
      deleteSubtaskMutation.mutate(subtaskId)
    }
  }

  return (
    <div className="space-y-2">
      {subtasks.map((subtask) => (
        <div
          key={subtask.id}
          className={`flex items-center space-x-3 p-3 rounded-lg border ${
            subtask.completed ? 'bg-muted/50' : 'bg-background'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-5 w-5"
            onClick={() => toggleSubtaskMutation.mutate(subtask)}
            disabled={toggleSubtaskMutation.isPending}
          >
            <CheckCircle 
              className={`w-4 h-4 ${
                subtask.completed 
                  ? 'text-green-600 fill-green-100' 
                  : 'text-muted-foreground hover:text-green-600'
              }`} 
            />
          </Button>

          <div className="flex-1 min-w-0">
            {editingSubtask === subtask.id ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave(subtask)
                  } else if (e.key === 'Escape') {
                    handleCancel()
                  }
                }}
                autoFocus
              />
            ) : (
              <span 
                className={`text-sm ${
                  subtask.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                }`}
              >
                {subtask.title}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {editingSubtask === subtask.id ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleSave(subtask)}
                  disabled={updateSubtaskMutation.isPending}
                >
                  <Save className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCancel}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEdit(subtask)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(subtask.id)}
                  disabled={deleteSubtaskMutation.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubtaskList

