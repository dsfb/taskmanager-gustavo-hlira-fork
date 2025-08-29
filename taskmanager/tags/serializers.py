from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer para etiquetas"""
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at', 'updated_at',
                 'tasks_count', 'completed_tasks_count', 'completion_percentage']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_tasks_count(self, obj):
        return obj.get_tasks_count()

    def get_completed_tasks_count(self, obj):
        return obj.get_completed_tasks_count()

    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Tag.objects.create(**validated_data)

    def validate_name(self, value):
        user = self.context['request'].user
        if Tag.objects.filter(user=user, name=value).exists():
            if not self.instance or self.instance.name != value:
                raise serializers.ValidationError("Já existe uma etiqueta com este nome.")
        return value

