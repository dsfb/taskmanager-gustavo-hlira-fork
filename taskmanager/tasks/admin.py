from django.contrib import admin
from .models import Task, Subtask, TaskHistory


class SubtaskInline(admin.TabularInline):
    model = Subtask
    extra = 0
    fields = ['title', 'completed', 'order']


class TaskHistoryInline(admin.StackedInline):
    model = TaskHistory
    extra = 0
    readonly_fields = ['completion_date']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'priority', 'completed', 'due_date', 'category', 'task_list', 'created_at']
    list_filter = ['completed', 'priority', 'category', 'task_list', 'user', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    filter_horizontal = ['tags']
    inlines = [SubtaskInline, TaskHistoryInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'user')
        }),
        ('Configurações', {
            'fields': ('priority', 'completed', 'due_date', 'reminder', 'estimated_duration')
        }),
        ('Organização', {
            'fields': ('task_list', 'category', 'tags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'task', 'completed', 'order', 'created_at']
    list_filter = ['completed', 'task__user', 'created_at']
    search_fields = ['title', 'task__title']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ['task', 'completion_date', 'estimated_duration', 'actual_duration']
    list_filter = ['completion_date', 'task__user']
    search_fields = ['task__title', 'notes']
    readonly_fields = ['completion_date']
