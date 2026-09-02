

from users.models import CustomUser
from users.permissions import IsAdmin


from .serializers import (
    AdminUserSerializer,
    AdminSelectionSerializer,
)
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

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=403,
            )

        total_users = CustomUser.objects.filter(
            role="USER"
        ).count()

        active_users = CustomUser.objects.filter(
            role="USER",
            is_active=True
        ).count()

        total_questions = Question.objects.count()

        total_completed = UserSelection.objects.filter(
            status="COMPLETED"
        ).count()

        return Response({
            "total_users": total_users,
            "active_users": active_users,
            "total_questions": total_questions,
            "total_completed": total_completed,
        })  


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=403,
            )

        users = CustomUser.objects.filter(
            role="USER"
        )

        data = []

        for user in users:

            selections = UserSelection.objects.filter(
                user=user
            )

            assigned = selections.count()

            completed = selections.filter(
                status="COMPLETED"
            ).count()

            in_progress = selections.filter(
                status="IN_PROGRESS"
            ).count()

            selected = selections.filter(
                status="SELECTED"
            ).count()

            progress = (
                round(
                    (completed / assigned) * 100
                )
                if assigned > 0
                else 0
            )

            data.append({
    "id": user.id,
    "username": user.username,
    "first_name": user.first_name,
    "last_name": user.last_name,
    "email": user.email,
    "assigned": assigned,
    "selected": selected,
    "completed": completed,
    "in_progress": in_progress,
    "progress": progress,
})

        return Response(data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):

        if not IsAdmin().has_permission(request, self):
            return Response(
                {"detail": "Admin access required."},
                status=403,
            )

        try:
            user = CustomUser.objects.get(
                id=user_id,
                role="USER"
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=404,
            )

        selections = UserSelection.objects.filter(
            user=user
        ).select_related("question")

        completed = selections.filter(
            status="COMPLETED"
        ).count()

        in_progress = selections.filter(
            status="IN_PROGRESS"
        ).count()

        selected = selections.filter(
            status="SELECTED"
        ).count()

        total = selections.count()

        progress = (
            round((completed / total) * 100)
            if total > 0
            else 0
        )

        return Response({
           "user": {
    "id": user.id,
    "username": user.username,
    "first_name": user.first_name,
    "last_name": user.last_name,
    "email": user.email,
},

            "progress": {
                "total": total,
                "selected": selected,
                "in_progress": in_progress,
                "completed": completed,
                "percentage": progress,
            },

            "questions": AdminSelectionSerializer(
                selections,
                many=True
            ).data,
        })