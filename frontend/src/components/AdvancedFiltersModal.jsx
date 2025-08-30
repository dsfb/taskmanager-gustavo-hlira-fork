import { useState } from 'react'
import { X, Filter, Calendar, Tag, List, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const AdvancedFiltersModal = ({ open, onOpenChange, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    title: '',
    priority: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    tags: '',
    hasDescription: false,
    isOverdue: false
  })

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    onApplyFilters(filters)
    onOpenChange(false)
  }

  const handleClear = () => {
    setFilters({
      title: '',
      priority: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      tags: '',
      hasDescription: false,
      isOverdue: false
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtros Avançados</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-2">
              <span>Título contém</span>
            </Label>
            <Input
              id="title"
              value={filters.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite parte do título..."
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Prioridade</span>
            </Label>
            <select
              id="priority"
              value={filters.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as prioridades</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluída</option>
              <option value="overdue">Atrasada</option>
            </select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Categoria</span>
            </Label>
            <Input
              id="category"
              value={filters.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Nome da categoria..."
            />
          </div>

          {/* Data de criação - De */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Criada a partir de</span>
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Data de criação - Até */}
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Criada até</span>
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Tags (separadas por vírgula)</span>
            </Label>
            <Input
              id="tags"
              value={filters.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="trabalho, pessoal, urgente..."
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasDescription"
                checked={filters.hasDescription}
                onChange={(e) => handleInputChange('hasDescription', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="hasDescription">Apenas tarefas com descrição</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isOverdue"
                checked={filters.isOverdue}
                onChange={(e) => handleInputChange('isOverdue', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isOverdue">Apenas tarefas atrasadas</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedFiltersModal

