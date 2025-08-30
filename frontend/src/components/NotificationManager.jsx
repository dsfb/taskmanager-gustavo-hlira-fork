import { useEffect, useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotificationManager = ({ tasks = [] }) => {
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    // Solicitar permissão para notificações
    if (permission === 'default') {
      Notification.requestPermission().then(result => {
        setPermission(result)
      })
    }
  }, [permission])

  useEffect(() => {
    // Verificar tarefas próximas do prazo
    const checkUpcomingTasks = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const upcomingTasks = tasks.filter(task => {
        if (task.completed || !task.due_date) return false
        
        const dueDate = new Date(task.due_date)
        return dueDate <= tomorrow && dueDate > now
      })

      upcomingTasks.forEach(task => {
        const notificationId = `task-${task.id}-due`
        
        // Verificar se já foi notificado
        const alreadyNotified = localStorage.getItem(notificationId)
        if (alreadyNotified) return

        // Criar notificação
        if (permission === 'granted') {
          const notification = new Notification('Tarefa próxima do prazo!', {
            body: `"${task.title}" vence em breve`,
            icon: '/favicon.ico',
            tag: notificationId
          })

          notification.onclick = () => {
            window.focus()
            notification.close()
          }

          // Marcar como notificado
          localStorage.setItem(notificationId, 'true')
        }

        // Adicionar à lista de notificações internas
        setNotifications(prev => {
          const exists = prev.find(n => n.id === notificationId)
          if (exists) return prev

          return [...prev, {
            id: notificationId,
            type: 'due',
            title: 'Tarefa próxima do prazo',
            message: `"${task.title}" vence em breve`,
            taskId: task.id,
            timestamp: new Date()
          }]
        })
      })
    }

    // Verificar tarefas atrasadas
    const checkOverdueTasks = () => {
      const now = new Date()
      
      const overdueTasks = tasks.filter(task => {
        if (task.completed || !task.due_date) return false
        
        const dueDate = new Date(task.due_date)
        return dueDate < now
      })

      overdueTasks.forEach(task => {
        const notificationId = `task-${task.id}-overdue`
        
        // Verificar se já foi notificado hoje
        const today = new Date().toDateString()
        const lastNotified = localStorage.getItem(`${notificationId}-${today}`)
        if (lastNotified) return

        // Adicionar à lista de notificações internas
        setNotifications(prev => {
          const exists = prev.find(n => n.id === notificationId)
          if (exists) return prev

          return [...prev, {
            id: notificationId,
            type: 'overdue',
            title: 'Tarefa atrasada',
            message: `"${task.title}" está atrasada`,
            taskId: task.id,
            timestamp: new Date()
          }]
        })

        // Marcar como notificado hoje
        localStorage.setItem(`${notificationId}-${today}`, 'true')
      })
    }

    checkUpcomingTasks()
    checkOverdueTasks()

    // Verificar a cada 30 minutos
    const interval = setInterval(() => {
      checkUpcomingTasks()
      checkOverdueTasks()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tasks, permission])

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const requestPermission = () => {
    Notification.requestPermission().then(result => {
      setPermission(result)
    })
  }

  if (notifications.length === 0 && permission === 'granted') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Botão para solicitar permissão */}
      {permission === 'default' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Ativar Notificações
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Receba alertas sobre prazos de tarefas
              </p>
              <Button 
                size="sm" 
                onClick={requestPermission}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
              >
                Ativar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notificações */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg ${
            notification.type === 'overdue' 
              ? 'border-red-200 dark:border-red-800' 
              : 'border-yellow-200 dark:border-yellow-800'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-1 rounded-full ${
              notification.type === 'overdue' 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-yellow-100 dark:bg-yellow-900/20'
            }`}>
              <Bell className={`h-4 w-4 ${
                notification.type === 'overdue' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {notification.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationManager

