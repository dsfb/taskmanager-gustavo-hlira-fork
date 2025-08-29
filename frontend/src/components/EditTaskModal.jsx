import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../lib/axios'

const EditTaskModal = ({ open, onOpenChange, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: null,
    priority: 'medium',
    category: '',
    task_list: '',
    tags: [],
    estimated_duration: '',
    reminder: null
  })
  const [dueDate, setDueDate] = useState(null)
  const [reminderDate, setReminderDate] = useState(null)
  const [dueTime, setDueTime] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  const queryClient = useQueryClient()

  // Fetch categories, lists, and tags
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories/').then(res => res.data.results || res.data)
  })

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists/').then(res => res.data.results || res.data)
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags/').then(res => res.data.results || res.data)
  })

  // Update form when task changes
  useEffect(() => {
    if (task && open) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date,
        priority: task.priority || 'medium',
        category: task.category?.toString() || '',
        task_list: task.task_list?.toString() || '',
        tags: task.tags || [],
        estimated_duration: task.estimated_duration || '',
        reminder: task.reminder
      })

      // Set dates and times
      if (task.due_date) {
        const dueDateTime = new Date(task.due_date)
        setDueDate(dueDateTime)
        setDueTime(format(dueDateTime, 'HH:mm'))
      } else {
        setDueDate(null)
        setDueTime('')
      }

      if (task.reminder) {
        const reminderDateTime = new Date(task.reminder)
        setReminderDate(reminderDateTime)
        setReminderTime(format(reminderDateTime, 'HH:mm'))
      } else {
        setReminderDate(null)
        setReminderTime('')
      }
    }
  }, [task, open])

  const updateTaskMutation = useMutation({
    mutationFn: (taskData) => api.put(`/tasks/${task.id}/`, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error updating task:', error)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const taskData = { ...formData }
    
    // Format due date
    if (dueDate && dueTime) {
      const [hours, minutes] = dueTime.split(':')
      const dueDateWithTime = new Date(dueDate)
      dueDateWithTime.setHours(parseInt(hours), parseInt(minutes))
      taskData.due_date = dueDateWithTime.toISOString()
    } else if (!dueDate) {
      taskData.due_date = null
    }
    
    // Format reminder date
    if (reminderDate && reminderTime) {
      const [hours, minutes] = reminderTime.split(':')
      const reminderDateWithTime = new Date(reminderDate)
      reminderDateWithTime.setHours(parseInt(hours), parseInt(minutes))
      taskData.reminder = reminderDateWithTime.toISOString()
    } else if (!reminderDate) {
      taskData.reminder = null
    }
    
    // Convert empty strings to null
    if (!taskData.category) taskData.category = null
    if (!taskData.task_list) taskData.task_list = null
    if (!taskData.estimated_duration) taskData.estimated_duration = null
    
    updateTaskMutation.mutate(taskData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Edite as informações da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva a tarefa (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lista</Label>
            <Select value={formData.task_list} onValueChange={(value) => handleInputChange('task_list', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma lista</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Limite</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDueDate(null)
                  setDueTime('')
                }}
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lembrete</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {reminderDate ? format(reminderDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reminderDate}
                    onSelect={setReminderDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setReminderDate(null)
                  setReminderTime('')
                }}
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Duração Estimada</Label>
            <Input
              id="estimated_duration"
              type="time"
              value={formData.estimated_duration}
              onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
              placeholder="HH:MM"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTaskMutation.isPending}>
              {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskModal

