from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'', views.TagViewSet, basename='tag')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]

