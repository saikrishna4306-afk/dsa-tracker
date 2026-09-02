from rest_framework import serializers

from .models import UserSelection, DailyQuestion,CodeSubmission
from questions.serializers import QuestionSerializer


class UserSelectionSerializer(serializers.ModelSerializer):

    question_title = serializers.CharField(
        source="question.title",
        read_only=True
    )

    question_url = serializers.URLField(
        source="question.url",
        read_only=True
    )

    difficulty = serializers.CharField(
        source="question.difficulty",
        read_only=True
    )

    topic = serializers.CharField(
        source="question.topic",
        read_only=True
    )

    platform = serializers.CharField(
        source="question.platform",
        read_only=True
    )

    class Meta:
        model = UserSelection

        fields = [
            "id",
            "user",
            "question",
            "question_title",
            "question_url",
            "difficulty",
            "topic",
            "platform",
            "status",
            "selected_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "question_title",
            "question_url",
            "difficulty",
            "topic",
            "platform",
            "selected_at",
            "updated_at",
        ]


class DailyQuestionSerializer(serializers.ModelSerializer):

    question = QuestionSerializer(read_only=True)

    class Meta:
        model = DailyQuestion
        fields = [
            "id",
            "date",
            "question",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "date",
            "created_at",
        ]
class CodeSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSubmission
        fields = [
            "id",
            "user",
            "question",
            "language",
            "code",
            "status",
            "test_cases_passed",
            "total_test_cases",
            "score",
            "feedback",
            "submitted_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "status",
            "test_cases_passed",
            "total_test_cases",
            "score",
            "feedback",
            "submitted_at",
            "updated_at",
        ]        