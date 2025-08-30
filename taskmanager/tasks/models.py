from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Task(models.Model):
    """
    Modelo principal para tarefas.
    Pode existir independentemente ou estar associada a uma lista.
    """
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name="Título",
        help_text="Título da tarefa (máximo 200 caracteres)"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
        help_text="Descrição detalhada da tarefa"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Data Limite",
        help_text="Data e hora limite para conclusão da tarefa"
    )
    completed = models.BooleanField(
        default=False,
        verbose_name="Concluída",
        help_text="Indica se a tarefa foi concluída"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name="Prioridade",
        help_text="Nível de prioridade da tarefa"
    )
    reminder = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Lembrete",
        help_text="Data e hora para lembrete da tarefa"
    )
    estimated_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name="Duração Estimada",
        help_text="Tempo estimado para conclusão da tarefa"
    )
    
    # Relacionamentos
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name="Usuário",
        help_text="Usuário proprietário da tarefa"
    )
    task_list = models.ForeignKey(
        'lists.TaskList',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name="Lista",
        help_text="Lista à qual a tarefa pertence (opcional)"
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name="Categoria",
        help_text="Categoria da tarefa (opcional)"
    )
    tags = models.ManyToManyField(
        'tags.Tag',
        blank=True,
        related_name='tasks',
        verbose_name="Etiquetas",
        help_text="Etiquetas associadas à tarefa"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Concluído em",
        help_text="Data e hora de conclusão da tarefa"
    )

    class Meta:
        verbose_name = "Tarefa"
        verbose_name_plural = "Tarefas"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['user', 'due_date']),
            models.Index(fields=['user', 'priority']),
        ]

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    def save(self, *args, **kwargs):
        """Override do save para gerenciar completed_at automaticamente"""
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def is_overdue(self):
        """Verifica se a tarefa está atrasada"""
        if not self.due_date or self.completed:
            return False
        return timezone.now() > self.due_date

    def days_until_due(self):
        """Retorna o número de dias até o vencimento"""
        if not self.due_date:
            return None
        delta = self.due_date.date() - timezone.now().date()
        return delta.days

    def get_priority_display_color(self):
        """Retorna a cor associada à prioridade"""
        colors = {
            'low': '#28a745',    # Verde
            'medium': '#ffc107', # Amarelo
            'high': '#dc3545',   # Vermelho
        }
        return colors.get(self.priority, '#6c757d')

    def get_subtasks_count(self):
        """Retorna o número total de subtarefas"""
        return self.subtasks.count()

    def get_completed_subtasks_count(self):
        """Retorna o número de subtarefas concluídas"""
        return self.subtasks.filter(completed=True).count()

    def get_subtasks_completion_percentage(self):
        """Retorna a porcentagem de conclusão das subtarefas"""
        total = self.get_subtasks_count()
        if total == 0:
            return 0
        completed = self.get_completed_subtasks_count()
        return round((completed / total) * 100, 2)

    def can_be_completed(self):
        """Verifica se a tarefa pode ser marcada como concluída"""
        # Todas as subtarefas devem estar concluídas
        return self.get_subtasks_count() == 0 or self.get_completed_subtasks_count() == self.get_subtasks_count()


class Subtask(models.Model):
    """
    Modelo para subtarefas.
    Cada subtarefa pertence a uma tarefa principal.
    """
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name="Título",
        help_text="Título da subtarefa (máximo 200 caracteres)"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
        help_text="Descrição detalhada da subtarefa"
    )
    completed = models.BooleanField(
        default=False,
        verbose_name="Concluída",
        help_text="Indica se a subtarefa foi concluída"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordem",
        help_text="Ordem de exibição da subtarefa"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name="Prioridade",
        help_text="Nível de prioridade da subtarefa"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Data Limite",
        help_text="Data e hora limite para conclusão da subtarefa"
    )
    reminder = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Lembrete",
        help_text="Data e hora para lembrete da subtarefa"
    )
    estimated_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name="Duração Estimada",
        help_text="Tempo estimado para conclusão da subtarefa"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Notas",
        help_text="Notas adicionais sobre a subtarefa"
    )
    
    # Relacionamentos
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='subtasks',
        verbose_name="Tarefa",
        help_text="Tarefa à qual a subtarefa pertence"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Concluído em"
    )

    class Meta:
        verbose_name = "Subtarefa"
        verbose_name_plural = "Subtarefas"
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.task.title})"

    def save(self, *args, **kwargs):
        """Override do save para gerenciar completed_at automaticamente"""
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def is_overdue(self):
        """Verifica se a subtarefa está atrasada"""
        if not self.due_date or self.completed:
            return False
        return timezone.now() > self.due_date

    def days_until_due(self):
        """Retorna o número de dias até o vencimento"""
        if not self.due_date:
            return None
        delta = self.due_date.date() - timezone.now().date()
        return delta.days

    def get_priority_display_color(self):
        """Retorna a cor associada à prioridade"""
        colors = {
            'low': '#28a745',    # Verde
            'medium': '#ffc107', # Amarelo
            'high': '#dc3545',   # Vermelho
        }
        return colors.get(self.priority, '#6c757d')


class TaskHistory(models.Model):
    """
    Modelo para histórico de tarefas concluídas.
    Armazena informações sobre a conclusão da tarefa.
    """
    completion_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Data de Conclusão"
    )
    estimated_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name="Duração Estimada",
        help_text="Tempo estimado que foi definido para a tarefa"
    )
    actual_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name="Duração Real",
        help_text="Tempo real gasto na tarefa"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Observações",
        help_text="Observações sobre a conclusão da tarefa"
    )
    
    # Relacionamentos
    task = models.OneToOneField(
        Task,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name="Tarefa",
        help_text="Tarefa à qual o histórico se refere"
    )

    class Meta:
        verbose_name = "Histórico de Tarefa"
        verbose_name_plural = "Históricos de Tarefas"
        ordering = ['-completion_date']

    def __str__(self):
        return f"Histórico: {self.task.title} - {self.completion_date.strftime('%d/%m/%Y')}"

    def get_duration_difference(self):
        """Retorna a diferença entre duração estimada e real"""
        if not self.estimated_duration or not self.actual_duration:
            return None
        return self.actual_duration - self.estimated_duration

    def was_completed_on_time(self):
        """Verifica se a tarefa foi concluída dentro do prazo estimado"""
        if not self.estimated_duration or not self.actual_duration:
            return None
        return self.actual_duration <= self.estimated_duration

