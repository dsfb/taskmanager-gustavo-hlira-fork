from rest_framework import serializers
from .models import Task, Subtask, TaskHistory
from categories.models import Category
from tags.models import Tag
from lists.models import TaskList


class SubtaskSerializer(serializers.ModelSerializer):
    """Serializer para subtarefas"""
    
    class Meta:
        model = Subtask
        fields = ['id', 'title', 'completed', 'order', 'created_at', 'updated_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']


class TaskHistorySerializer(serializers.ModelSerializer):
    """Serializer para histórico de tarefas"""
    duration_difference = serializers.SerializerMethodField()
    was_on_time = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskHistory
        fields = ['id', 'completion_date', 'estimated_duration', 'actual_duration', 
                 'notes', 'duration_difference', 'was_on_time']
        read_only_fields = ['id', 'completion_date']

    def get_duration_difference(self, obj):
        diff = obj.get_duration_difference()
        return str(diff) if diff else None

    def get_was_on_time(self, obj):
        return obj.was_completed_on_time()


class TaskSerializer(serializers.ModelSerializer):
    """Serializer para tarefas"""
    subtasks = SubtaskSerializer(many=True, read_only=True)
    history = TaskHistorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    task_list_name = serializers.CharField(source='task_list.name', read_only=True)
    tags_names = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    
    # Campos calculados
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    priority_color = serializers.SerializerMethodField()
    subtasks_count = serializers.SerializerMethodField()
    completed_subtasks_count = serializers.SerializerMethodField()
    subtasks_completion_percentage = serializers.SerializerMethodField()
    can_be_completed = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'completed', 'priority', 
                 'reminder', 'estimated_duration', 'task_list', 'category', 'tags',
                 'created_at', 'updated_at', 'completed_at', 'subtasks', 'history',
                 'category_name', 'task_list_name', 'tags_names', 'is_overdue',
                 'days_until_due', 'priority_color', 'subtasks_count', 
                 'completed_subtasks_count', 'subtasks_completion_percentage',
                 'can_be_completed']
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

    def get_is_overdue(self, obj):
        return obj.is_overdue()

    def get_days_until_due(self, obj):
        return obj.days_until_due()

    def get_priority_color(self, obj):
        return obj.get_priority_display_color()

    def get_subtasks_count(self, obj):
        return obj.get_subtasks_count()

    def get_completed_subtasks_count(self, obj):
        return obj.get_completed_subtasks_count()

    def get_subtasks_completion_percentage(self, obj):
        return obj.get_subtasks_completion_percentage()

    def get_can_be_completed(self, obj):
        return obj.can_be_completed()

    def validate(self, attrs):
        # Validar que task_list e category pertencem ao usuário
        user = self.context['request'].user
        
        if 'task_list' in attrs and attrs['task_list']:
            if attrs['task_list'].user != user:
                raise serializers.ValidationError("Lista não pertence ao usuário.")
        
        if 'category' in attrs and attrs['category']:
            if attrs['category'].user != user:
                raise serializers.ValidationError("Categoria não pertence ao usuário.")
        
        return attrs

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        validated_data['user'] = self.context['request'].user
        task = Task.objects.create(**validated_data)
        task.tags.set(tags_data)
        return task


class TaskListSerializer(serializers.ModelSerializer):
    """Serializer básico para tarefas (para listagem)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    task_list_name = serializers.CharField(source='task_list.name', read_only=True)
    tags_count = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    priority_color = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'completed', 'priority', 'category_name',
                 'task_list_name', 'tags_count', 'is_overdue', 'priority_color',
                 'created_at', 'updated_at']

    def get_tags_count(self, obj):
        return obj.tags.count()

    def get_is_overdue(self, obj):
        return obj.is_overdue()

    def get_priority_color(self, obj):
        return obj.get_priority_display_color()

