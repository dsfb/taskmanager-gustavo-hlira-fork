import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ExportButton = ({ tasks }) => {
  const exportToCSV = () => {
    const headers = ['Título', 'Descrição', 'Prioridade', 'Status', 'Data de Criação']
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.priority,
        task.completed ? 'Concluída' : 'Pendente',
        new Date(task.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tarefas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Button variant="outline" size="sm" onClick={exportToCSV}>
      <Download className="w-4 h-4 mr-2" />
      Exportar CSV
    </Button>
  )
}

export default ExportButton

