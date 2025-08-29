from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'', views.TaskListViewSet, basename='tasklist')

urlpatterns = [
    # Tarefas de uma lista específica
    path('<int:pk>/tasks/', views.TaskListTasksView.as_view(), name='tasklist-tasks'),
    
    # Include router URLs
    path('', include(router.urls)),
]

