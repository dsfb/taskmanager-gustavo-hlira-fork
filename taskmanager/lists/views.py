from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import TaskList
from .serializers import TaskListSerializer
from tasks.serializers import TaskListSerializer as TaskSerializer


class TaskListViewSet(viewsets.ModelViewSet):
    """ViewSet para listas de tarefas"""
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskList.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Listar tarefas de uma lista específica"""
        task_list = self.get_object()
        tasks = task_list.tasks.all()
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)


class TaskListTasksView(APIView):
    """View para tarefas de uma lista específica"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            task_list = TaskList.objects.get(pk=pk, user=request.user)
        except TaskList.DoesNotExist:
            return Response({'error': 'Lista não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        tasks = task_list.tasks.all()
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)
