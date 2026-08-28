from django.conf import settings
from django.db import models


class UserSelection(models.Model):

    class Status(models.TextChoices):
        SELECTED = "SELECTED", "Selected"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="selections",
    )

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="selections",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SELECTED,
    )

    selected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "question"],
                name="unique_user_question_selection",
            )
        ]


class DailyQuestion(models.Model):
    date = models.DateField(unique=True)

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="daily_questions",
    )

    created_at = models.DateTimeField(auto_now_add=True)