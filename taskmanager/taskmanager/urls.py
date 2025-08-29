"""
URL configuration for taskmanager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """Root endpoint da API"""
    return JsonResponse({
        'message': 'TaskManager API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/',
            'tasks': '/api/tasks/',
            'lists': '/api/lists/',
            'categories': '/api/categories/',
            'tags': '/api/tags/',
        }
    })

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API root
    path('', api_root, name='api-root'),
    
    # API endpoints
    path('api/', include([
        path('auth/', include('accounts.urls')),
        path('tasks/', include('tasks.urls')),
        path('lists/', include('lists.urls')),
        path('categories/', include('categories.urls')),
        path('tags/', include('tags.urls')),
    ])),
    
    # DRF browsable API
    path('api-auth/', include('rest_framework.urls')),
]

