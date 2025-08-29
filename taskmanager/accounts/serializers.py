from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de novos usuários"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)  # Criar token automaticamente
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer para login de usuários"""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Username e senha são obrigatórios.')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil do usuário"""
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    categories_count = serializers.SerializerMethodField()
    tags_count = serializers.SerializerMethodField()
    lists_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined',
                 'tasks_count', 'completed_tasks_count', 'categories_count', 'tags_count', 'lists_count')
        read_only_fields = ('id', 'username', 'date_joined')

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(completed=True).count()

    def get_categories_count(self, obj):
        return obj.categories.count()

    def get_tags_count(self, obj):
        return obj.tags.count()

    def get_lists_count(self, obj):
        return obj.task_lists.count()

