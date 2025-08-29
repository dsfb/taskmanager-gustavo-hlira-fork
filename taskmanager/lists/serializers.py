from rest_framework import serializers
from .models import TaskList


class TaskListSerializer(serializers.ModelSerializer):
    """Serializer para listas de tarefas"""
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    pending_tasks_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    overdue_tasks_count = serializers.SerializerMethodField()
    high_priority_tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = TaskList
        fields = ['id', 'name', 'description', 'custom_profile', 'auto_suggestion',
                 'created_at', 'updated_at', 'tasks_count', 'completed_tasks_count',
                 'pending_tasks_count', 'completion_percentage', 'overdue_tasks_count',
                 'high_priority_tasks_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_tasks_count(self, obj):
        return obj.get_tasks_count()

    def get_completed_tasks_count(self, obj):
        return obj.get_completed_tasks_count()

    def get_pending_tasks_count(self, obj):
        return obj.get_pending_tasks_count()

    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()

    def get_overdue_tasks_count(self, obj):
        return obj.get_overdue_tasks_count()

    def get_high_priority_tasks_count(self, obj):
        return obj.get_high_priority_tasks_count()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return TaskList.objects.create(**validated_data)

    def validate_name(self, value):
        user = self.context['request'].user
        if TaskList.objects.filter(user=user, name=value).exists():
            if not self.instance or self.instance.name != value:
                raise serializers.ValidationError("Já existe uma lista com este nome.")
        return value

