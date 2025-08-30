import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Brain, 
  Lightbulb, 
  Plus, 
  Sparkles,
  Clock,
  Target,
  Calendar,
  Tag,
  List,
  CheckCircle,
  RefreshCw,
  Wand2
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '../lib/axios'

const SmartSuggestionsModal = ({ open, onOpenChange, onCreateTask }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set())
  const [activeTab, setActiveTab] = useState('smart')

  // Fetch data for generating suggestions
  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['smart-suggestions'],
    queryFn: async () => {
      const [tasksRes, categoriesRes, listsRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/categories/'),
        api.get('/lists/')
      ])

      const tasks = tasksRes.data.results || tasksRes.data
      const categories = categoriesRes.data.results || categoriesRes.data
      const lists = listsRes.data.results || listsRes.data

      return generateSmartSuggestions(tasks, categories, lists)
    },
    enabled: open
  })

  const generateSmartSuggestions = (tasks, categories, lists) => {
    const now = new Date()
    const suggestions = {
      smart: [],
      contextual: [],
      templates: [],
      recurring: []
    }

    // Smart suggestions based on patterns
    suggestions.smart = [
      {
        id: 'daily-review',
        title: 'Revisão Diária',
        description: 'Revisar progresso e planejar próximas ações',
        category: 'Produtividade',
        priority: 'medium',
        estimatedDuration: '15 minutos',
        tags: ['revisão', 'planejamento'],
        reason: 'Baseado em padrões de alta produtividade'
      },
      {
        id: 'weekly-planning',
        title: 'Planejamento Semanal',
        description: 'Definir objetivos e prioridades para a semana',
        category: 'Planejamento',
        priority: 'high',
        estimatedDuration: '30 minutos',
        tags: ['planejamento', 'objetivos'],
        reason: 'Usuários com planejamento semanal são 40% mais produtivos'
      },
      {
        id: 'skill-development',
        title: 'Desenvolvimento de Habilidades',
        description: 'Dedicar tempo para aprender algo novo',
        category: 'Desenvolvimento',
        priority: 'medium',
        estimatedDuration: '1 hora',
        tags: ['aprendizado', 'crescimento'],
        reason: 'Investimento em desenvolvimento pessoal'
      }
    ]

    // Contextual suggestions based on current tasks
    const incompleteTasks = tasks.filter(task => !task.completed)
    const overdueTasks = incompleteTasks.filter(task => 
      task.due_date && new Date(task.due_date) < now
    )

    if (overdueTasks.length > 0) {
      suggestions.contextual.push({
        id: 'review-overdue',
        title: 'Revisar Tarefas Atrasadas',
        description: `Analisar e reagendar ${overdueTasks.length} tarefa(s) atrasada(s)`,
        category: 'Organização',
        priority: 'high',
        estimatedDuration: '20 minutos',
        tags: ['revisão', 'organização'],
        reason: 'Você tem tarefas atrasadas que precisam de atenção'
      })
    }

    // Check for tasks without categories
    const uncategorizedTasks = tasks.filter(task => !task.category)
    if (uncategorizedTasks.length > 3) {
      suggestions.contextual.push({
        id: 'categorize-tasks',
        title: 'Categorizar Tarefas',
        description: `Organizar ${uncategorizedTasks.length} tarefas sem categoria`,
        category: 'Organização',
        priority: 'medium',
        estimatedDuration: '15 minutos',
        tags: ['organização', 'categorização'],
        reason: 'Tarefas categorizadas são mais fáceis de gerenciar'
      })
    }

    // Template suggestions
    suggestions.templates = [
      {
        id: 'project-kickoff',
        title: 'Iniciar Novo Projeto',
        description: 'Template completo para começar um projeto',
        category: 'Projetos',
        priority: 'high',
        subtasks: [
          'Definir objetivos do projeto',
          'Identificar stakeholders',
          'Criar cronograma inicial',
          'Definir recursos necessários',
          'Estabelecer marcos importantes'
        ],
        tags: ['projeto', 'planejamento'],
        reason: 'Template estruturado para projetos bem-sucedidos'
      },
      {
        id: 'meeting-prep',
        title: 'Preparação para Reunião',
        description: 'Checklist para preparar reuniões eficazes',
        category: 'Reuniões',
        priority: 'medium',
        subtasks: [
          'Definir agenda da reunião',
          'Preparar materiais necessários',
          'Revisar tópicos anteriores',
          'Enviar convites e agenda',
          'Preparar perguntas-chave'
        ],
        tags: ['reunião', 'preparação'],
        reason: 'Reuniões preparadas são 60% mais eficazes'
      },
      {
        id: 'learning-session',
        title: 'Sessão de Aprendizado',
        description: 'Estrutura para sessões de estudo eficazes',
        category: 'Desenvolvimento',
        priority: 'medium',
        subtasks: [
          'Escolher tópico de estudo',
          'Definir objetivos de aprendizado',
          'Reunir materiais e recursos',
          'Criar cronograma de estudo',
          'Planejar aplicação prática'
        ],
        tags: ['aprendizado', 'desenvolvimento'],
        reason: 'Aprendizado estruturado é mais efetivo'
      }
    ]

    // Recurring task suggestions
    suggestions.recurring = [
      {
        id: 'daily-standup',
        title: 'Check-in Diário',
        description: 'Breve revisão diária de progresso',
        category: 'Rotina',
        priority: 'low',
        frequency: 'Diário',
        estimatedDuration: '5 minutos',
        tags: ['rotina', 'check-in'],
        reason: 'Manter consciência do progresso diário'
      },
      {
        id: 'weekly-review',
        title: 'Revisão Semanal',
        description: 'Análise semanal de produtividade e ajustes',
        category: 'Análise',
        priority: 'medium',
        frequency: 'Semanal',
        estimatedDuration: '30 minutos',
        tags: ['revisão', 'análise'],
        reason: 'Reflexão regular melhora a produtividade'
      },
      {
        id: 'monthly-goals',
        title: 'Definição de Metas Mensais',
        description: 'Estabelecer objetivos para o próximo mês',
        category: 'Planejamento',
        priority: 'high',
        frequency: 'Mensal',
        estimatedDuration: '45 minutos',
        tags: ['metas', 'planejamento'],
        reason: 'Metas claras direcionam o foco'
      }
    ]

    return suggestions
  }

  const handleToggleSuggestion = (suggestionId) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId)
      } else {
        newSet.add(suggestionId)
      }
      return newSet
    })
  }

  const handleCreateSelected = () => {
    if (!suggestions) return

    const allSuggestions = [
      ...suggestions.smart,
      ...suggestions.contextual,
      ...suggestions.templates,
      ...suggestions.recurring
    ]

    const selectedItems = allSuggestions.filter(suggestion => 
      selectedSuggestions.has(suggestion.id)
    )

    selectedItems.forEach(suggestion => {
      const taskData = {
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority || 'medium',
        category_name: suggestion.category,
        tags: suggestion.tags || [],
        estimated_duration: suggestion.estimatedDuration,
        subtasks: suggestion.subtasks || []
      }

      onCreateTask(taskData)
    })

    setSelectedSuggestions(new Set())
    onOpenChange(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  const SuggestionCard = ({ suggestion, type }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        selectedSuggestions.has(suggestion.id) 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'hover:shadow-md'
      }`}
      onClick={() => handleToggleSuggestion(suggestion.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center">
              {selectedSuggestions.has(suggestion.id) && (
                <CheckCircle className="w-4 h-4 mr-2 text-primary" />
              )}
              {suggestion.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {suggestion.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
            {getPriorityLabel(suggestion.priority)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {suggestion.category && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{suggestion.category}</span>
                </div>
              )}
              {suggestion.estimatedDuration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{suggestion.estimatedDuration}</span>
                </div>
              )}
              {suggestion.frequency && (
                <div className="flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>{suggestion.frequency}</span>
                </div>
              )}
            </div>
          </div>

          {suggestion.subtasks && suggestion.subtasks.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Subtarefas incluídas:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {suggestion.subtasks.slice(0, 3).map((subtask, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                    <span>{subtask}</span>
                  </li>
                ))}
                {suggestion.subtasks.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{suggestion.subtasks.length - 3} mais...
                  </li>
                )}
              </ul>
            </div>
          )}

          {suggestion.tags && suggestion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestion.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            💡 {suggestion.reason}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Sugestões Inteligentes
          </DialogTitle>
          <DialogDescription>
            A IA analisou seus padrões e sugere tarefas que podem melhorar sua produtividade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : suggestions ? (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="smart">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Inteligentes
                  </TabsTrigger>
                  <TabsTrigger value="contextual">
                    <Target className="w-4 h-4 mr-1" />
                    Contextuais
                  </TabsTrigger>
                  <TabsTrigger value="templates">
                    <List className="w-4 h-4 mr-1" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="recurring">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Recorrentes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="smart" className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    Sugestões baseadas em padrões de alta produtividade
                  </div>
                  {suggestions.smart.map(suggestion => (
                    <SuggestionCard 
                      key={suggestion.id} 
                      suggestion={suggestion} 
                      type="smart" 
                    />
                  ))}
                </TabsContent>

                <TabsContent value="contextual" className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    Sugestões baseadas no seu contexto atual
                  </div>
                  {suggestions.contextual.length > 0 ? (
                    suggestions.contextual.map(suggestion => (
                      <SuggestionCard 
                        key={suggestion.id} 
                        suggestion={suggestion} 
                        type="contextual" 
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>Tudo está organizado! Nenhuma sugestão contextual no momento.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    Templates estruturados para diferentes tipos de trabalho
                  </div>
                  {suggestions.templates.map(suggestion => (
                    <SuggestionCard 
                      key={suggestion.id} 
                      suggestion={suggestion} 
                      type="template" 
                    />
                  ))}
                </TabsContent>

                <TabsContent value="recurring" className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    Tarefas recorrentes para manter a consistência
                  </div>
                  {suggestions.recurring.map(suggestion => (
                    <SuggestionCard 
                      key={suggestion.id} 
                      suggestion={suggestion} 
                      type="recurring" 
                    />
                  ))}
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedSuggestions.size} sugestão(ões) selecionada(s)
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button 
                    onClick={handleCreateSelected}
                    disabled={selectedSuggestions.size === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Selecionadas ({selectedSuggestions.size})
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SmartSuggestionsModal

