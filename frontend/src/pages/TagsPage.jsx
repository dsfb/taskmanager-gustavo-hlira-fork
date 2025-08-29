import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteTagModal from '../components/DeleteTagModal'
import api from '../lib/axios'

const TagsPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff'
  })

  const queryClient = useQueryClient()

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags/').then(res => res.data.results || res.data)
  })

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (tagData) => api.post('/tags/', tagData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags'])
      resetForm()
      setCreateModalOpen(false)
    },
    onError: (error) => {
      console.error('Error creating tag:', error)
    }
  })

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: ({ id, ...tagData }) => api.put(`/tags/${id}/`, tagData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this tag
      resetForm()
      setEditModalOpen(false)
      setSelectedTag(null)
    },
    onError: (error) => {
      console.error('Error updating tag:', error)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#007bff'
    })
  }

  const handleCreate = () => {
    setCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (tag) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color || '#007bff'
    })
    setEditModalOpen(true)
  }

  const handleDelete = (tag) => {
    setSelectedTag(tag)
    setDeleteModalOpen(true)
  }

  const handleViewTasks = (tag) => {
    // Navigate to tasks page with tag filter
    window.location.href = `/app/tasks?tag=${tag.id}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedTag) {
      updateTagMutation.mutate({ id: selectedTag.id, ...formData })
    } else {
      createTagMutation.mutate(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const TagCard = ({ tag }) => (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color || '#007bff' }}
            ></div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{tag.name}</CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewTasks(tag)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver tarefas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(tag)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(tag)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {tag.tasks_count || 0} tarefa{(tag.tasks_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          {tag.completion_percentage !== undefined && (
            <Badge variant="secondary">
              {Math.round(tag.completion_percentage)}% concluído
            </Badge>
          )}
        </div>
        
        {/* Progress bar if there are tasks */}
        {(tag.tasks_count > 0) && (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${tag.completion_percentage || 0}%`,
                  backgroundColor: tag.color || '#007bff'
                }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Etiquetas</h1>
          <p className="text-muted-foreground">
            Marque suas tarefas com etiquetas personalizadas
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Etiqueta
        </Button>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : tags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma etiqueta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira etiqueta para marcar suas tarefas
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Etiqueta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false)
          setEditModalOpen(false)
          setSelectedTag(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTag ? 'Editar Etiqueta' : 'Nova Etiqueta'}
            </DialogTitle>
            <DialogDescription>
              {selectedTag 
                ? 'Edite as informações da etiqueta.' 
                : 'Crie uma nova etiqueta para marcar suas tarefas.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome da etiqueta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#007bff"
                  className="flex-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setCreateModalOpen(false)
                setEditModalOpen(false)
                setSelectedTag(null)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTagMutation.isPending || updateTagMutation.isPending}>
                {createTagMutation.isPending || updateTagMutation.isPending 
                  ? 'Salvando...' 
                  : selectedTag ? 'Salvar Alterações' : 'Criar Etiqueta'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteTagModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        tag={selectedTag}
      />
    </div>
  )
}

export default TagsPage

