from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Category(models.Model):
    """
    Modelo para categorias de tarefas.
    Permite classificar tarefas por contexto geral (ex: Trabalho, Estudos, Pessoal).
    """
    name = models.CharField(
        max_length=50,
        verbose_name="Nome",
        help_text="Nome da categoria (máximo 50 caracteres)"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
        help_text="Descrição opcional da categoria"
    )
    color = models.CharField(
        max_length=7,
        default='#007bff',
        verbose_name="Cor",
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Cor deve estar no formato hexadecimal (#RRGGBB)'
            )
        ],
        help_text="Cor da categoria em formato hexadecimal (ex: #007bff)"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='categories',
        verbose_name="Usuário",
        help_text="Usuário proprietário da categoria"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em"
    )

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['name']
        unique_together = ['user', 'name']  # Nome único por usuário

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_tasks_count(self):
        """Retorna o número de tarefas nesta categoria"""
        return self.tasks.count()

    def get_completed_tasks_count(self):
        """Retorna o número de tarefas concluídas nesta categoria"""
        return self.tasks.filter(completed=True).count()

    def get_completion_percentage(self):
        """Retorna a porcentagem de conclusão das tarefas desta categoria"""
        total = self.get_tasks_count()
        if total == 0:
            return 0
        completed = self.get_completed_tasks_count()
        return round((completed / total) * 100, 2)
