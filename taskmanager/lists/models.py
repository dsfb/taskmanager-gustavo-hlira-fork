from django.db import models
from django.contrib.auth.models import User


class TaskList(models.Model):
    """
    Modelo para listas de tarefas.
    Permite agrupar tarefas por contexto, projeto ou qualquer critério definido pelo usuário.
    """
    name = models.CharField(
        max_length=100,
        verbose_name="Nome",
        help_text="Nome da lista (máximo 100 caracteres)"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
        help_text="Descrição opcional da lista"
    )
    custom_profile = models.BooleanField(
        default=False,
        verbose_name="Perfil Personalizado",
        help_text="Indica se a lista possui configurações personalizadas"
    )
    auto_suggestion = models.BooleanField(
        default=False,
        verbose_name="Sugestão Automática",
        help_text="Permite que o sistema sugira automaticamente tarefas para esta lista"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='task_lists',
        verbose_name="Usuário",
        help_text="Usuário proprietário da lista"
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
        verbose_name = "Lista de Tarefas"
        verbose_name_plural = "Listas de Tarefas"
        ordering = ['name']
        unique_together = ['user', 'name']  # Nome único por usuário

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_tasks_count(self):
        """Retorna o número total de tarefas na lista"""
        return self.tasks.count()

    def get_completed_tasks_count(self):
        """Retorna o número de tarefas concluídas na lista"""
        return self.tasks.filter(completed=True).count()

    def get_pending_tasks_count(self):
        """Retorna o número de tarefas pendentes na lista"""
        return self.tasks.filter(completed=False).count()

    def get_completion_percentage(self):
        """Retorna a porcentagem de conclusão das tarefas da lista"""
        total = self.get_tasks_count()
        if total == 0:
            return 0
        completed = self.get_completed_tasks_count()
        return round((completed / total) * 100, 2)

    def get_overdue_tasks_count(self):
        """Retorna o número de tarefas atrasadas na lista"""
        from django.utils import timezone
        return self.tasks.filter(
            completed=False,
            due_date__lt=timezone.now()
        ).count()

    def get_high_priority_tasks_count(self):
        """Retorna o número de tarefas de alta prioridade na lista"""
        return self.tasks.filter(priority='high').count()
