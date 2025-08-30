import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, List, Edit, Trash2, CheckCircle, MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteListModal from '../components/DeleteListModal'
import api from '../lib/axios'

const ListsPage = () => {
  const navigate = useNavigate()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedList, setSelectedList] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    custom_profile: false,
    auto_suggestion: false
  })

  const queryClient = useQueryClient()

  // Fetch lists
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists/').then(res => res.data.results || res.data)
  })

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (listData) => api.post('/lists/', listData),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists'])
      resetForm()
      setCreateModalOpen(false)
    },
    onError: (error) => {
      console.error('Error creating list:', error)
    }
  })

  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: ({ id, ...listData }) => api.put(`/lists/${id}/`, listData),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this list
      resetForm()
      setEditModalOpen(false)
      setSelectedList(null)
    },
    onError: (error) => {
      console.error('Error updating list:', error)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      custom_profile: false,
      auto_suggestion: false
    })
  }

  const handleCreate = () => {
    setCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (list) => {
    setSelectedList(list)
    setFormData({
      name: list.name,
      description: list.description || '',
      custom_profile: list.custom_profile || false,
      auto_suggestion: list.auto_suggestion || false
    })
    setEditModalOpen(true)
  }

  const handleDelete = (list) => {
    setSelectedList(list)
    setDeleteModalOpen(true)
  }

  const handleViewTasks = (list) => {
    // Navigate to list detail page
    navigate(`/app/lists/${list.id}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedList) {
      updateListMutation.mutate({ id: selectedList.id, ...formData })
    } else {
      createListMutation.mutate(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const ListCard = ({ list }) => (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <List className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{list.name}</CardTitle>
              {list.description && (
                <CardDescription className="mt-1">
                  {list.description.length > 100 
                    ? `${list.description.substring(0, 100)}...` 
                    : list.description
                  }
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewTasks(list)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver tarefas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(list)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(list)}
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
        <div className="space-y-3">
          {/* Task count and completion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {list.tasks_count || 0} tarefa{(list.tasks_count || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            {list.completion_percentage !== undefined && (
              <Badge variant="secondary">
                {Math.round(list.completion_percentage)}% concluído
              </Badge>
            )}
          </div>
          
          {/* Progress bar */}
          {(list.tasks_count > 0) && (
            <div className="space-y-1">
              <Progress value={list.completion_percentage || 0} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{list.completed_tasks_count || 0} concluídas</span>
                <span>{(list.tasks_count || 0) - (list.completed_tasks_count || 0)} pendentes</span>
              </div>
            </div>
          )}
          
          {/* List features */}
          <div className="flex items-center space-x-2">
            {list.custom_profile && (
              <Badge variant="outline" className="text-xs">
                Perfil Personalizado
              </Badge>
            )}
            {list.auto_suggestion && (
              <Badge variant="outline" className="text-xs">
                Sugestão Automática
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Listas</h1>
          <p className="text-muted-foreground">
            Organize suas tarefas em listas por projeto ou contexto
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma lista encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira lista para organizar suas tarefas por projeto
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Lista
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false)
          setEditModalOpen(false)
          setSelectedList(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedList ? 'Editar Lista' : 'Nova Lista'}
            </DialogTitle>
            <DialogDescription>
              {selectedList 
                ? 'Edite as informações da lista.' 
                : 'Crie uma nova lista para organizar suas tarefas por projeto ou contexto.'
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
                placeholder="Digite o nome da lista"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva a lista (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="custom_profile"
                  checked={formData.custom_profile}
                  onCheckedChange={(checked) => handleInputChange('custom_profile', checked)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="custom_profile" className="text-sm font-medium">
                    Perfil Personalizado
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permite configurações personalizadas para esta lista
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_suggestion"
                  checked={formData.auto_suggestion}
                  onCheckedChange={(checked) => handleInputChange('auto_suggestion', checked)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="auto_suggestion" className="text-sm font-medium">
                    Sugestão Automática
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ativa sugestões automáticas de tarefas para esta lista
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setCreateModalOpen(false)
                setEditModalOpen(false)
                setSelectedList(null)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createListMutation.isPending || updateListMutation.isPending}>
                {createListMutation.isPending || updateListMutation.isPending 
                  ? 'Salvando...' 
                  : selectedList ? 'Salvar Alterações' : 'Criar Lista'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteListModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        list={selectedList}
      />
    </div>
  )
}

export default ListsPage

