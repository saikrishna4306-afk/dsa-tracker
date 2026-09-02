from django.shortcuts import redirect

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication

from rest_framework_simplejwt.tokens import RefreshToken

from allauth.socialaccount.models import SocialAccount

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class GoogleJWTView(APIView):

    authentication_classes = [SessionAuthentication]

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        social_account = SocialAccount.objects.filter(
            user=user,
            provider="google"
        ).first()

        if social_account:

            extra_data = social_account.extra_data

            user.first_name = extra_data.get(
                "given_name",
                ""
            )

            user.last_name = extra_data.get(
                "family_name",
                ""
            )

            google_email = extra_data.get(
                "email"
            )

            if google_email:
                user.email = google_email

            user.save()

        refresh = RefreshToken.for_user(user)

        access_token = str(
            refresh.access_token
        )

        refresh_token = str(refresh)

        frontend_url = (
            "http://localhost:5173/google-callback"
            f"#access={access_token}"
            f"&refresh={refresh_token}"
        )

        return redirect(frontend_url)