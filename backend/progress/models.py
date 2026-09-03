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
        related_name="selections"
    )

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="selections"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SELECTED
    )

    selected_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "question"],
                name="unique_user_question_selection",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.question.title}"


class DailyQuestion(models.Model):

    date = models.DateField(
        unique=True
    )

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="daily_questions"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.date} - {self.question.title}"


class CodeSubmission(models.Model):

    class SubmissionStatus(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        RUNNING = "RUNNING", "Running"
        PASSED = "PASSED", "Passed"
        FAILED = "FAILED", "Failed"
        ERROR = "ERROR", "Error"

    class Language(models.TextChoices):
        PYTHON = "PYTHON", "Python"
        JAVASCRIPT = "JAVASCRIPT", "JavaScript"
        JAVA = "JAVA", "Java"
        CPP = "CPP", "C++"

    # -----------------------------------
    # User and Question
    # -----------------------------------

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="code_submissions"
    )

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="code_submissions"
    )

    # -----------------------------------
    # Code Information
    # -----------------------------------

    language = models.CharField(
        max_length=20,
        choices=Language.choices
    )

    code = models.TextField()

    # -----------------------------------
    # Submission Status
    # -----------------------------------

    status = models.CharField(
        max_length=20,
        choices=SubmissionStatus.choices,
        default=SubmissionStatus.SUBMITTED
    )

    # -----------------------------------
    # Test Case Results
    # -----------------------------------

    test_cases_passed = models.IntegerField(
        default=0
    )

    total_test_cases = models.IntegerField(
        default=0
    )

    test_results = models.JSONField(
        default=list,
        blank=True
    )

    # -----------------------------------
    # Final Score
    # -----------------------------------

    score = models.FloatField(
        null=True,
        blank=True
    )

    # -----------------------------------
    # AI Score Breakdown
    # -----------------------------------

    algorithm_score = models.FloatField(
        null=True,
        blank=True
    )

    time_complexity_score = models.FloatField(
        null=True,
        blank=True
    )

    space_complexity_score = models.FloatField(
        null=True,
        blank=True
    )

    code_quality_score = models.FloatField(
        null=True,
        blank=True
    )

    # -----------------------------------
    # AI Feedback
    # -----------------------------------

    algorithm_feedback = models.TextField(
        blank=True
    )

    time_complexity = models.TextField(
        blank=True
    )

    space_complexity = models.TextField(
        blank=True
    )

    code_quality_feedback = models.TextField(
        blank=True
    )

    overall_feedback = models.TextField(
        blank=True
    )

    # -----------------------------------
    # General Feedback
    # -----------------------------------

    feedback = models.TextField(
        blank=True
    )

    # -----------------------------------
    # Timestamps
    # -----------------------------------

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.question.title}"


class TestCase(models.Model):

    question = models.ForeignKey(
        "questions.Question",
        on_delete=models.CASCADE,
        related_name="test_cases"
    )

    input_data = models.JSONField()

    expected_output = models.JSONField()

    is_hidden = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Test case for {self.question.title}"