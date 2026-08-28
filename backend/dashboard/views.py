from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from questions.models import Question
from progress.models import UserSelection

class DashboardView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        total_questions=Question.objects.count()
        user_selections=UserSelection.objects.filter(
            user=request.user
        )
        selected=user_selections.filter(
            status="SELECTED"
        ).count()
        in_progress=user_selections.filter(
            status="IN_PROGRESS"
        ).count()
        completed=user_selections.filter(
            status='COMPLETED'
        ).count()

        remaining=total_questions-(
            selected+in_progress+completed
        )
        if total_questions > 0:
            progress_percentage=(
                completed/total_questions
            )*100

        else:
            progress_percentage=0   


        return Response({
            "total_questions": total_questions,
            "selected": selected,
            "in_progress": in_progress,
            "completed": completed,
            "remaining": remaining,
            "progress_percentage": round(
                progress_percentage, 2
            ),
        }) 