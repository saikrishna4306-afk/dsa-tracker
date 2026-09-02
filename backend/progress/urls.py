from django.urls import path

from .views import (
    DailyQuestionView,
    UserSelectionDetailView,
    UserSelectionView,
    CodeSubmissionView,
)

urlpatterns = [
    path("", UserSelectionView.as_view(), name="user-selection"),

    path("daily/", DailyQuestionView.as_view(), name="daily-question"),

    path(
        "<int:pk>/",
        UserSelectionDetailView.as_view(),
        name="user-selection-detail",
    ),
    path(
    "submissions/",
    CodeSubmissionView.as_view(),
    name="code-submissions",
),
]