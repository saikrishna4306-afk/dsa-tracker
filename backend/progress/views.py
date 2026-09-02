from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserSelection,DailyQuestion,CodeSubmission
from .serializers import UserSelectionSerializer,DailyQuestionSerializer,CodeSubmissionSerializer
from drf_spectacular.utils import extend_schema


class UserSelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selections = UserSelection.objects.filter(
            user=request.user
        )

        serializer = UserSelectionSerializer(
            selections,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = UserSelectionSerializer(data=request.data)

        if serializer.is_valid():
            selection = serializer.save(user=request.user)

            return Response(
                UserSelectionSerializer(selection).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserSelectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            selection = UserSelection.objects.get(
                pk=pk,
                user=request.user,
            )
        except UserSelection.DoesNotExist:
            return Response(
                {"detail": "Progress record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserSelectionSerializer(
            selection,
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
class DailyQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone

        today = timezone.localdate()

        try:
            daily_question = DailyQuestion.objects.get(
                date=today
            )
        except DailyQuestion.DoesNotExist:
            return Response(
                {"detail": "No daily question found for today."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DailyQuestionSerializer(daily_question)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )    

class CodeSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = CodeSubmission.objects.filter(
            user=request.user
        ).order_by("-submitted_at")

        serializer = CodeSubmissionSerializer(
            submissions,
            many=True
        )

        return Response(serializer.data)

    @extend_schema(
        request=CodeSubmissionSerializer,
        responses=CodeSubmissionSerializer,
    )
    def post(self, request):
        serializer = CodeSubmissionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            submission = serializer.save(
                user=request.user
            )

            return Response(
                CodeSubmissionSerializer(submission).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )