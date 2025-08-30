import { useState, useEffect } from 'react'
import { Play, Pause, Square, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TaskTimer = ({ task }) => {
  const [time, setTime] = useState(25 * 60) // 25 minutos
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      // Alternar entre trabalho e pausa
      if (isBreak) {
        setTime(25 * 60) // Volta para 25 min de trabalho
        setIsBreak(false)
      } else {
        setTime(5 * 60) // 5 min de pausa
        setIsBreak(true)
      }
      // Notificação
      if (Notification.permission === 'granted') {
        new Notification(isBreak ? 'Pausa terminada!' : 'Tempo de pausa!', {
          body: isBreak ? 'Hora de voltar ao trabalho' : 'Faça uma pausa de 5 minutos'
        })
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, time, isBreak])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
    setIsRunning(true)
  }

  const pauseTimer = () => setIsRunning(false)
  
  const resetTimer = () => {
    setIsRunning(false)
    setTime(25 * 60)
    setIsBreak(false)
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Timer className="w-4 h-4" />
      <span className="font-mono text-sm">
        {formatTime(time)} {isBreak ? '(Pausa)' : '(Foco)'}
      </span>
      <Button size="sm" variant="ghost" onClick={isRunning ? pauseTimer : startTimer}>
        {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </Button>
      <Button size="sm" variant="ghost" onClick={resetTimer}>
        <Square className="w-3 h-3" />
      </Button>
    </div>
  )
}

export default TaskTimer

