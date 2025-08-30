import { useState, useMemo } from 'react'
import { X, BarChart3, PieChart, TrendingUp, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ReportsModal = ({ open, onOpenChange, tasks = [] }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed
    const overdue = tasks.filter(t => !t.completed && new Date(t.due_date) < new Date()).length
    
    const byPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    }

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Tarefas por semana (últimas 4 semanas)
    const weeklyData = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekTasks = tasks.filter(t => {
        const taskDate = new Date(t.created_at)
        return taskDate >= weekStart && taskDate <= weekEnd
      })

      weeklyData.push({
        week: `Sem ${4-i}`,
        created: weekTasks.length,
        completed: weekTasks.filter(t => t.completed).length
      })
    }

    return {
      total,
      completed,
      pending,
      overdue,
      byPriority,
      completionRate,
      weeklyData
    }
  }, [tasks])

  const exportReport = () => {
    const reportData = {
      'Relatório de Produtividade': '',
      'Data de Geração': new Date().toLocaleDateString('pt-BR'),
      '': '',
      'RESUMO GERAL': '',
      'Total de Tarefas': stats.total,
      'Tarefas Concluídas': stats.completed,
      'Tarefas Pendentes': stats.pending,
      'Tarefas Atrasadas': stats.overdue,
      'Taxa de Conclusão': `${stats.completionRate}%`,
      ' ': '',
      'POR PRIORIDADE': '',
      'Alta Prioridade': stats.byPriority.high,
      'Média Prioridade': stats.byPriority.medium,
      'Baixa Prioridade': stats.byPriority.low
    }

    const csvContent = Object.entries(reportData)
      .map(([key, value]) => `"${key}","${value}"`)
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_produtividade_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Relatórios e Estatísticas</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tendências
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total de Tarefas</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Concluídas</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Atrasadas</div>
              </div>
            </div>

            {/* Taxa de conclusão */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Taxa de Conclusão</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completionRate}%
                </span>
              </div>
            </div>

            {/* Distribuição por prioridade */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Prioridade</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-600 dark:text-red-400">Alta</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.byPriority.high / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{stats.byPriority.high}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-600 dark:text-yellow-400">Média</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.byPriority.medium / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{stats.byPriority.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 dark:text-green-400">Baixa</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.byPriority.low / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{stats.byPriority.low}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Produtividade Semanal (Últimas 4 Semanas)
              </h3>
              <div className="space-y-4">
                {stats.weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {week.week}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400 w-16">Criadas</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${week.created * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-6">{week.created}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600 dark:text-green-400 w-16">Concluídas</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${week.completed * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-6">{week.completed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insights</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>
                    Você tem <strong>{stats.total}</strong> tarefas no total, com uma taxa de conclusão de <strong>{stats.completionRate}%</strong>.
                  </p>
                </div>
                {stats.overdue > 0 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p>
                      Atenção: você tem <strong>{stats.overdue}</strong> tarefa(s) atrasada(s) que precisam de atenção.
                    </p>
                  </div>
                )}
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>
                    Continue assim! Você já concluiu <strong>{stats.completed}</strong> tarefa(s).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsModal

