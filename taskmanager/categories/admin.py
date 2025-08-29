from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'tasks_count', 'completion_percentage', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def tasks_count(self, obj):
        return obj.get_tasks_count()
    tasks_count.short_description = 'Tarefas'
    
    def completion_percentage(self, obj):
        return f"{obj.get_completion_percentage()}%"
    completion_percentage.short_description = 'Conclusão'
