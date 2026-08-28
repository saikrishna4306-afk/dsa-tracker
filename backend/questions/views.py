from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import Question
from .serializers import QuestionSerializer
from users.permissions import IsAdmin


class QuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = Question.objects.all()

        # Filter by difficulty
        difficulty = request.query_params.get("difficulty")

        if difficulty:
            questions = questions.filter(
                difficulty__iexact=difficulty
            )

        # Filter by topic
        topic = request.query_params.get("topic")

        if topic:
            questions = questions.filter(
                topic__iexact=topic
            )

        # Filter by platform
        platform = request.query_params.get("platform")

        if platform:
            questions = questions.filter(
                platform__iexact=platform
            )

        # Search by title
        search = request.query_params.get("search")

        if search:
            questions = questions.filter(
                title__icontains=search
            )

        # Sort questions
        sort = request.query_params.get("sort")

        if sort:
            questions = questions.order_by(sort)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10

        paginated_questions = paginator.paginate_queryset(
            questions,
            request
        )

        serializer = QuestionSerializer(
            paginated_questions,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):
        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = QuestionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class QuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            question = Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return Response(
                {"detail": "Question not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = QuestionSerializer(question)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            question = Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return Response(
                {"detail": "Question not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = QuestionSerializer(
            question,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            question = Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return Response(
                {"detail": "Question not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        question.delete()

        return Response(
            {"detail": "Question deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )