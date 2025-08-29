import { useQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, List, Tag, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'

const DashboardPage = () => {
  const { user } = useAuth()

  // Fetch dashboard data
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks/').then(res => res.data.results || res.data)
  })

  const { data: todayTasks = [] } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => api.get('/tasks/today/').then(res => res.data.results || res.data)
  })

  const { data: overdueTasks = [] } = useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => api.get('/tasks/overdue/').then(res => res.data.results || res.data)
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories/').then(res => res.data.results || res.data)
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags/').then(res => res.data.results || res.data)
  })

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/lists/').then(res => res.data.results || res.data)
  })

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length
  const todayTasksCount = todayTasks.length
  const overdueTasksCount = overdueTasks.length

  const stats = [
    {
      title: 'Total de Tarefas',
      value: totalTasks,
      description: `${completedTasks} concluídas`,
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      title: 'Tarefas Pendentes',
      value: pendingTasks,
      description: `${highPriorityTasks} alta prioridade`,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Para Hoje',
      value: todayTasksCount,
      description: 'Tarefas com prazo hoje',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Atrasadas',
      value: overdueTasksCount,
      description: 'Precisam de atenção',
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ]

  const organizationStats = [
    {
      title: 'Categorias',
      value: categories.length,
      icon: FolderOpen,
      color: 'text-purple-600'
    },
    {
      title: 'Tags',
      value: tags.length,
      icon: Tag,
      color: 'text-pink-600'
    },
    {
      title: 'Listas',
      value: lists.length,
      icon: List,
      color: 'text-indigo-600'
    }
  ]

  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const TaskCard = ({ task }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
      <div className={`w-3 h-3 rounded-full ${
        task.priority === 'high' ? 'bg-red-500' :
        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
      }`}></div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.due_date && (
          <p className="text-xs text-muted-foreground">
            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      {task.completed && (
        <CheckCircle className="w-4 h-4 text-green-600" />
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Olá, {user?.first_name || user?.username || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo das suas tarefas e progresso
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Progresso Geral</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxa de Conclusão</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
              <div className="text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
            <CardDescription>
              Suas ferramentas de organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizationStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm">{stat.title}</span>
                  </div>
                  <Badge variant="secondary">{stat.value}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tarefas Recentes</CardTitle>
            <CardDescription>
              Suas últimas tarefas criadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(overdueTasksCount > 0 || todayTasksCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Tarefas que precisam da sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overdueTasksCount > 0 && (
                <Badge variant="destructive">
                  {overdueTasksCount} tarefa{overdueTasksCount !== 1 ? 's' : ''} atrasada{overdueTasksCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {todayTasksCount > 0 && (
                <Badge variant="default">
                  {todayTasksCount} tarefa{todayTasksCount !== 1 ? 's' : ''} para hoje
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage

