from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'', views.TaskViewSet, basename='task')

urlpatterns = [
    # Ações específicas de tarefas
    path('<int:pk>/complete/', views.TaskCompleteView.as_view(), name='task-complete'),
    path('<int:pk>/uncomplete/', views.TaskUncompleteView.as_view(), name='task-uncomplete'),
    path('<int:task_id>/subtasks/', views.SubtaskListCreateView.as_view(), name='subtask-list'),
    path('subtasks/<int:pk>/', views.SubtaskDetailView.as_view(), name='subtask-detail'),
    
    # Include router URLs
    path('', include(router.urls)),
]

