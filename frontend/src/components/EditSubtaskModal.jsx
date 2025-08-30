import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

const EditSubtaskModal = ({ open, onOpenChange, subtask, taskId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: null,
    priority: 'medium',
    estimated_duration: '',
    reminder: null,
    notes: ''
  })
  const [dueDate, setDueDate] = useState(null)
  const [reminderDate, setReminderDate] = useState(null)
  const [dueTime, setDueTime] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  const queryClient = useQueryClient()

  // Update form when subtask changes
  useEffect(() => {
    if (subtask && open) {
      setFormData({
        title: subtask.title || '',
        description: subtask.description || '',
        due_date: subtask.due_date,
        priority: subtask.priority || 'medium',
        estimated_duration: subtask.estimated_duration || '',
        reminder: subtask.reminder,
        notes: subtask.notes || ''
      })

      // Set dates and times
      if (subtask.due_date) {
        const dueDateTime = new Date(subtask.due_date)
        setDueDate(dueDateTime)
        setDueTime(format(dueDateTime, 'HH:mm'))
      } else {
        setDueDate(null)
        setDueTime('')
      }

      if (subtask.reminder) {
        const reminderDateTime = new Date(subtask.reminder)
        setReminderDate(reminderDateTime)
        setReminderTime(format(reminderDateTime, 'HH:mm'))
      } else {
        setReminderDate(null)
        setReminderTime('')
      }
    }
  }, [subtask, open])

  const updateSubtaskMutation = useMutation({
    mutationFn: (subtaskData) => api.put(`/subtasks/${subtask.id}/`, subtaskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subtasks', taskId])
      queryClient.invalidateQueries(['tasks'])
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error updating subtask:', error)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const subtaskData = { ...formData }
    
    // Format due date
    if (dueDate && dueTime) {
      const [hours, minutes] = dueTime.split(':')
      const dueDateWithTime = new Date(dueDate)
      dueDateWithTime.setHours(parseInt(hours), parseInt(minutes))
      subtaskData.due_date = dueDateWithTime.toISOString()
    } else if (!dueDate) {
      subtaskData.due_date = null
    }
    
    // Format reminder date
    if (reminderDate && reminderTime) {
      const [hours, minutes] = reminderTime.split(':')
      const reminderDateWithTime = new Date(reminderDate)
      reminderDateWithTime.setHours(parseInt(hours), parseInt(minutes))
      subtaskData.reminder = reminderDateWithTime.toISOString()
    } else if (!reminderDate) {
      subtaskData.reminder = null
    }
    
    // Convert empty strings to null
    if (!subtaskData.estimated_duration) subtaskData.estimated_duration = null
    
    updateSubtaskMutation.mutate(subtaskData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!subtask) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Subtarefa</DialogTitle>
          <DialogDescription>
            Edite as informações da subtarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título da subtarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva a subtarefa (opcional)"
              rows={3}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Adicione notas ou observações sobre esta subtarefa"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateSubtaskMutation.isPending}>
              {updateSubtaskMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSubtaskModal

