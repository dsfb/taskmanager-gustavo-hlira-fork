from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Task, Subtask, TaskHistory
from .serializers import TaskSerializer, TaskListSerializer, SubtaskSerializer, TaskHistorySerializer


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet para tarefas"""
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['completed', 'priority', 'category', 'task_list']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related(
            'category', 'task_list'
        ).prefetch_related('tags', 'subtasks')

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marcar tarefa como concluída"""
        task = self.get_object()
        
        if not task.can_be_completed():
            return Response({
                'error': 'Não é possível concluir a tarefa. Todas as subtarefas devem estar concluídas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task.completed = True
        task.save()
        
        # Criar histórico se não existir
        if not hasattr(task, 'history'):
            TaskHistory.objects.create(
                task=task,
                estimated_duration=task.estimated_duration,
                notes=request.data.get('notes', '')
            )
        
        return Response({
            'message': 'Tarefa marcada como concluída',
            'task': TaskSerializer(task, context={'request': request}).data
        })

    @action(detail=True, methods=['post'])
    def uncomplete(self, request, pk=None):
        """Desmarcar tarefa como concluída"""
        task = self.get_object()
        task.completed = False
        task.save()
        
        # Remover histórico se existir
        if hasattr(task, 'history'):
            task.history.delete()
        
        return Response({
            'message': 'Tarefa desmarcada como concluída',
            'task': TaskSerializer(task, context={'request': request}).data
        })

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Listar tarefas atrasadas"""
        overdue_tasks = self.get_queryset().filter(
            completed=False,
            due_date__lt=timezone.now()
        )
        serializer = self.get_serializer(overdue_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Listar tarefas para hoje"""
        today = timezone.now().date()
        today_tasks = self.get_queryset().filter(
            due_date__date=today
        )
        serializer = self.get_serializer(today_tasks, many=True)
        return Response(serializer.data)


class TaskCompleteView(APIView):
    """View para marcar/desmarcar tarefa como concluída"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, user=request.user)
        except Task.DoesNotExist:
            return Response({'error': 'Tarefa não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        if not task.can_be_completed():
            return Response({
                'error': 'Não é possível concluir a tarefa. Todas as subtarefas devem estar concluídas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task.completed = True
        task.save()
        
        return Response({'message': 'Tarefa marcada como concluída'})


class TaskUncompleteView(APIView):
    """View para desmarcar tarefa como concluída"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, user=request.user)
        except Task.DoesNotExist:
            return Response({'error': 'Tarefa não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        task.completed = False
        task.save()
        
        return Response({'message': 'Tarefa desmarcada como concluída'})


class SubtaskListCreateView(ListCreateAPIView):
    """View para listar e criar subtarefas"""
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return Subtask.objects.filter(task_id=task_id, task__user=self.request.user)

    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        try:
            task = Task.objects.get(pk=task_id, user=self.request.user)
        except Task.DoesNotExist:
            return Response({'error': 'Tarefa não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer.save(task=task)


class SubtaskDetailView(RetrieveUpdateDestroyAPIView):
    """View para detalhes, atualização e exclusão de subtarefas"""
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subtask.objects.filter(task__user=self.request.user)
