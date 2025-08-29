import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FolderOpen, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteCategoryModal from '../components/DeleteCategoryModal'
import api from '../lib/axios'

const CategoriesPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff'
  })

  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories/').then(res => res.data.results || res.data)
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => api.post('/categories/', categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      resetForm()
      setCreateModalOpen(false)
    },
    onError: (error) => {
      console.error('Error creating category:', error)
    }
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...categoryData }) => api.put(`/categories/${id}/`, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['tasks']) // Refresh tasks as they might reference this category
      resetForm()
      setEditModalOpen(false)
      setSelectedCategory(null)
    },
    onError: (error) => {
      console.error('Error updating category:', error)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#007bff'
    })
  }

  const handleCreate = () => {
    setCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#007bff'
    })
    setEditModalOpen(true)
  }

  const handleDelete = (category) => {
    setSelectedCategory(category)
    setDeleteModalOpen(true)
  }

  const handleViewTasks = (category) => {
    // Navigate to tasks page with category filter
    window.location.href = `/app/tasks?category=${category.id}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory.id, ...formData })
    } else {
      createCategoryMutation.mutate(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const CategoryCard = ({ category }) => (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color || '#007bff' }}
            ></div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.description && (
                <CardDescription className="mt-1">
                  {category.description.length > 80 
                    ? `${category.description.substring(0, 80)}...` 
                    : category.description
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
              <DropdownMenuItem onClick={() => handleViewTasks(category)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver tarefas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(category)}
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
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {category.tasks_count || 0} tarefa{(category.tasks_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          {category.completion_percentage !== undefined && (
            <Badge variant="secondary">
              {Math.round(category.completion_percentage)}% concluído
            </Badge>
          )}
        </div>
        
        {/* Progress bar if there are tasks */}
        {(category.tasks_count > 0) && (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${category.completion_percentage || 0}%`,
                  backgroundColor: category.color || '#007bff'
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
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas tarefas por contexto e área de trabalho
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira categoria para organizar suas tarefas
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Categoria
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false)
          setEditModalOpen(false)
          setSelectedCategory(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Edite as informações da categoria.' 
                : 'Crie uma nova categoria para organizar suas tarefas.'
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
                placeholder="Digite o nome da categoria"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva a categoria (opcional)"
                rows={3}
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
                setSelectedCategory(null)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                  ? 'Salvando...' 
                  : selectedCategory ? 'Salvar Alterações' : 'Criar Categoria'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteCategoryModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        category={selectedCategory}
      />
    </div>
  )
}

export default CategoriesPage

