from rest_framework import serializers

from questions.serializers import QuestionSerializer

from .models import DailyQuestion, UserSelection


class UserSelectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSelection
        fields = [
            "id",
            "user",
            "question",
            "status",
            "selected_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
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