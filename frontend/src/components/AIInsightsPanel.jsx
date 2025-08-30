import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Clock,
  CheckCircle,
  BarChart3,
  Zap,
  RefreshCw,
  X,
  ChevronRight,
  Calendar,
  List,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '../lib/axios'

const AIInsightsPanel = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('insights')
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set())

  // Fetch AI insights
  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      // Simulate AI analysis - in a real app, this would call an AI service
      const [tasksRes, categoriesRes, listsRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/categories/'),
        api.get('/lists/')
      ])

      const tasks = tasksRes.data.results || tasksRes.data
      const categories = categoriesRes.data.results || categoriesRes.data
      const lists = listsRes.data.results || listsRes.data

      return generateAIInsights(tasks, categories, lists)
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  const generateAIInsights = (tasks, categories, lists) => {
    const now = new Date()
    const completedTasks = tasks.filter(task => task.completed)
    const pendingTasks = tasks.filter(task => !task.completed)
    const overdueTasks = pendingTasks.filter(task => 
      task.due_date && new Date(task.due_date) < now
    )

    // Productivity Analysis
    const productivityInsights = analyzeProductivity(tasks, completedTasks, pendingTasks)
    
    // Pattern Recognition
    const patterns = recognizePatterns(tasks, categories, lists)
    
    // Smart Suggestions
    const suggestions = generateSmartSuggestions(tasks, categories, lists, overdueTasks)
    
    // Optimization Opportunities
    const optimizations = findOptimizations(tasks, categories, lists)

    return {
      productivity: productivityInsights,
      patterns,
      suggestions,
      optimizations,
      stats: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
      }
    }
  }

  const analyzeProductivity = (tasks, completed, pending) => {
    const insights = []
    
    // Completion rate analysis
    const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0
    
    if (completionRate >= 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excelente Produtividade!',
        description: `Você tem uma taxa de conclusão de ${Math.round(completionRate)}%. Continue assim!`,
        action: 'Considere aumentar seus objetivos ou assumir projetos mais desafiadores.'
      })
    } else if (completionRate >= 60) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'Boa Produtividade',
        description: `Taxa de conclusão de ${Math.round(completionRate)}%. Há espaço para melhorias.`,
        action: 'Tente focar em tarefas de alta prioridade primeiro.'
      })
    } else {
      insights.push({
        type: 'error',
        icon: AlertTriangle,
        title: 'Produtividade Baixa',
        description: `Taxa de conclusão de ${Math.round(completionRate)}%. Vamos melhorar isso!`,
        action: 'Considere quebrar tarefas grandes em subtarefas menores.'
      })
    }

    // Time management analysis
    const tasksWithDueDate = tasks.filter(task => task.due_date)
    const onTimeTasks = tasksWithDueDate.filter(task => 
      task.completed && task.completed_at && task.due_date &&
      new Date(task.completed_at) <= new Date(task.due_date)
    )
    
    if (tasksWithDueDate.length > 0) {
      const onTimeRate = (onTimeTasks.length / tasksWithDueDate.length) * 100
      
      if (onTimeRate >= 80) {
        insights.push({
          type: 'success',
          icon: Clock,
          title: 'Excelente Gestão de Tempo',
          description: `${Math.round(onTimeRate)}% das suas tarefas são concluídas no prazo.`,
          action: 'Você é ótimo em cumprir prazos! Mantenha essa disciplina.'
        })
      } else {
        insights.push({
          type: 'warning',
          icon: Clock,
          title: 'Gestão de Tempo Precisa Melhorar',
          description: `Apenas ${Math.round(onTimeRate)}% das tarefas são concluídas no prazo.`,
          action: 'Tente definir prazos mais realistas ou usar lembretes.'
        })
      }
    }

    return insights
  }

  const recognizePatterns = (tasks, categories, lists) => {
    const patterns = []

    // Most productive category
    const categoryStats = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.category === category.id)
      const completed = categoryTasks.filter(task => task.completed)
      return {
        category,
        total: categoryTasks.length,
        completed: completed.length,
        rate: categoryTasks.length > 0 ? (completed.length / categoryTasks.length) * 100 : 0
      }
    }).filter(stat => stat.total > 0).sort((a, b) => b.rate - a.rate)

    if (categoryStats.length > 0) {
      const topCategory = categoryStats[0]
      patterns.push({
        icon: Tag,
        title: 'Categoria Mais Produtiva',
        description: `Você é mais produtivo em "${topCategory.category.name}" com ${Math.round(topCategory.rate)}% de conclusão.`,
        insight: 'Considere aplicar as estratégias desta categoria em outras áreas.'
      })
    }

    // Most used priority
    const priorityStats = ['high', 'medium', 'low'].map(priority => {
      const priorityTasks = tasks.filter(task => task.priority === priority)
      return {
        priority,
        count: priorityTasks.length,
        label: priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'
      }
    }).sort((a, b) => b.count - a.count)

    if (priorityStats[0].count > 0) {
      patterns.push({
        icon: BarChart3,
        title: 'Padrão de Prioridades',
        description: `Você usa mais a prioridade "${priorityStats[0].label}" (${priorityStats[0].count} tarefas).`,
        insight: 'Equilibre melhor as prioridades para uma gestão mais eficaz.'
      })
    }

    // Task creation patterns
    const recentTasks = tasks.filter(task => {
      const createdDate = new Date(task.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate >= weekAgo
    })

    if (recentTasks.length > 0) {
      patterns.push({
        icon: Calendar,
        title: 'Atividade Recente',
        description: `Você criou ${recentTasks.length} tarefas na última semana.`,
        insight: recentTasks.length > 10 ? 'Você está muito ativo! Cuidado para não se sobrecarregar.' : 'Mantenha o ritmo de criação de tarefas.'
      })
    }

    return patterns
  }

  const generateSmartSuggestions = (tasks, categories, lists, overdueTasks) => {
    const suggestions = []

    // Overdue tasks suggestion
    if (overdueTasks.length > 0) {
      suggestions.push({
        id: 'overdue-tasks',
        type: 'urgent',
        icon: AlertTriangle,
        title: 'Tarefas Atrasadas Precisam de Atenção',
        description: `Você tem ${overdueTasks.length} tarefa(s) atrasada(s).`,
        action: 'Revisar e reagendar tarefas atrasadas',
        actionType: 'review-overdue'
      })
    }

    // Category organization suggestion
    const uncategorizedTasks = tasks.filter(task => !task.category)
    if (uncategorizedTasks.length > 5) {
      suggestions.push({
        id: 'categorize-tasks',
        type: 'optimization',
        icon: Tag,
        title: 'Organize Suas Tarefas',
        description: `${uncategorizedTasks.length} tarefas não têm categoria definida.`,
        action: 'Categorizar tarefas pendentes',
        actionType: 'categorize'
      })
    }

    // List organization suggestion
    const unlistedTasks = tasks.filter(task => !task.task_list)
    if (unlistedTasks.length > 3) {
      suggestions.push({
        id: 'organize-lists',
        type: 'optimization',
        icon: List,
        title: 'Crie Listas Temáticas',
        description: `${unlistedTasks.length} tarefas poderiam ser organizadas em listas.`,
        action: 'Criar listas para organizar tarefas',
        actionType: 'create-lists'
      })
    }

    // Productivity boost suggestion
    const highPriorityPending = tasks.filter(task => 
      !task.completed && task.priority === 'high'
    )
    if (highPriorityPending.length > 0) {
      suggestions.push({
        id: 'focus-high-priority',
        type: 'productivity',
        icon: Zap,
        title: 'Foque nas Prioridades Altas',
        description: `Você tem ${highPriorityPending.length} tarefa(s) de alta prioridade pendente(s).`,
        action: 'Trabalhar em tarefas prioritárias',
        actionType: 'focus-priority'
      })
    }

    // Break down large tasks suggestion
    const largeTasks = tasks.filter(task => 
      !task.completed && 
      task.description && 
      task.description.length > 200 &&
      (!task.subtasks_count || task.subtasks_count === 0)
    )
    if (largeTasks.length > 0) {
      suggestions.push({
        id: 'break-down-tasks',
        type: 'strategy',
        icon: Target,
        title: 'Divida Tarefas Complexas',
        description: `${largeTasks.length} tarefa(s) complexa(s) poderiam ser divididas em subtarefas.`,
        action: 'Criar subtarefas para tarefas complexas',
        actionType: 'create-subtasks'
      })
    }

    return suggestions
  }

  const findOptimizations = (tasks, categories, lists) => {
    const optimizations = []

    // Duplicate task detection
    const taskTitles = tasks.map(task => task.title.toLowerCase().trim())
    const duplicates = taskTitles.filter((title, index) => 
      taskTitles.indexOf(title) !== index
    )
    
    if (duplicates.length > 0) {
      optimizations.push({
        icon: RefreshCw,
        title: 'Tarefas Duplicadas Detectadas',
        description: `Encontrei possíveis tarefas duplicadas em seu sistema.`,
        impact: 'Reduzir redundância e confusão',
        effort: 'Baixo'
      })
    }

    // Empty categories/lists
    const emptyCategories = categories.filter(category => 
      !tasks.some(task => task.category === category.id)
    )
    const emptyLists = lists.filter(list => 
      !tasks.some(task => task.task_list === list.id)
    )

    if (emptyCategories.length > 0 || emptyLists.length > 0) {
      optimizations.push({
        icon: Target,
        title: 'Limpeza de Organização',
        description: `${emptyCategories.length} categoria(s) e ${emptyLists.length} lista(s) vazias.`,
        impact: 'Interface mais limpa e organizada',
        effort: 'Baixo'
      })
    }

    // Workflow optimization
    const completedTasksWithSubtasks = tasks.filter(task => 
      task.completed && task.subtasks_count > 0
    )
    if (completedTasksWithSubtasks.length > 0) {
      optimizations.push({
        icon: Zap,
        title: 'Padrão de Sucesso Identificado',
        description: 'Tarefas com subtarefas têm maior taxa de conclusão.',
        impact: 'Aplicar estratégia de subtarefas em mais projetos',
        effort: 'Médio'
      })
    }

    return optimizations
  }

  const handleDismissSuggestion = (suggestionId) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50'
      case 'optimization': return 'border-blue-200 bg-blue-50'
      case 'productivity': return 'border-green-200 bg-green-50'
      case 'strategy': return 'border-purple-200 bg-purple-50'
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return AlertTriangle
      case 'optimization': return Target
      case 'productivity': return TrendingUp
      case 'strategy': return Lightbulb
      case 'success': return CheckCircle
      case 'warning': return Clock
      case 'error': return AlertTriangle
      default: return Brain
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) return null

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Insights da IA
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Análise inteligente dos seus padrões de produtividade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="optimization">Otimização</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Conclusão</span>
                <span className="font-medium">{Math.round(insights.stats.completionRate)}%</span>
              </div>
              <Progress value={insights.stats.completionRate} className="h-2" />
            </div>

            <div className="space-y-3">
              {insights.productivity.map((insight, index) => {
                const IconComponent = insight.icon
                return (
                  <Alert key={index} className={getTypeColor(insight.type)}>
                    <IconComponent className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-sm">{insight.description}</p>
                        <p className="text-xs text-muted-foreground">{insight.action}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {insights.suggestions
              .filter(suggestion => !dismissedSuggestions.has(suggestion.id))
              .map((suggestion) => {
                const IconComponent = suggestion.icon
                return (
                  <div key={suggestion.id} className={`border rounded-lg p-3 ${getTypeColor(suggestion.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{suggestion.title}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            {suggestion.action}
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            
            {insights.suggestions.filter(s => !dismissedSuggestions.has(s.id)).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Todas as sugestões foram aplicadas!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-3">
            {insights.patterns.map((pattern, index) => {
              const IconComponent = pattern.icon
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <IconComponent className="w-5 h-5 mt-0.5 text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{pattern.title}</p>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <p className="text-xs text-blue-600">{pattern.insight}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-3">
            {insights.optimizations.map((optimization, index) => {
              const IconComponent = optimization.icon
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <IconComponent className="w-5 h-5 mt-0.5 text-orange-500" />
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{optimization.title}</p>
                      <p className="text-sm text-muted-foreground">{optimization.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Impacto:</span>
                          <span className="text-green-600">{optimization.impact}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Esforço:</span>
                          <Badge variant="outline" className="text-xs">
                            {optimization.effort}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AIInsightsPanel

