from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Tag(models.Model):
    """
    Modelo para etiquetas (tags) de tarefas.
    Permite marcação personalizada das tarefas (ex: Urgente, Reunião, Cliente).
    """
    name = models.CharField(
        max_length=30,
        verbose_name="Nome",
        help_text="Nome da etiqueta (máximo 30 caracteres)"
    )
    color = models.CharField(
        max_length=7,
        default='#6c757d',
        verbose_name="Cor",
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Cor deve estar no formato hexadecimal (#RRGGBB)'
            )
        ],
        help_text="Cor da etiqueta em formato hexadecimal (ex: #6c757d)"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tags',
        verbose_name="Usuário",
        help_text="Usuário proprietário da etiqueta"
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
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"
        ordering = ['name']
        unique_together = ['user', 'name']  # Nome único por usuário

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_tasks_count(self):
        """Retorna o número de tarefas com esta etiqueta"""
        return self.tasks.count()

    def get_completed_tasks_count(self):
        """Retorna o número de tarefas concluídas com esta etiqueta"""
        return self.tasks.filter(completed=True).count()

    def get_completion_percentage(self):
        """Retorna a porcentagem de conclusão das tarefas com esta etiqueta"""
        total = self.get_tasks_count()
        if total == 0:
            return 0
        completed = self.get_completed_tasks_count()
        return round((completed / total) * 100, 2)
