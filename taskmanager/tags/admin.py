from django.contrib import admin
from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'tasks_count', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    def tasks_count(self, obj):
        return obj.get_tasks_count()
    tasks_count.short_description = 'Tarefas'
