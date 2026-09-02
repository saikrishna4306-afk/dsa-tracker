from rest_framework import serializers

from users.models import CustomUser
from progress.models import UserSelection


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
        ]


class AdminSelectionSerializer(serializers.ModelSerializer):
    question_title = serializers.CharField(
        source="question.title",
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
            "question",
            "question_title",
            "difficulty",
            "topic",
            "platform",
            "status",
            "selected_at",
            "updated_at",
        ]