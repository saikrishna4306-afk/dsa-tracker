from django.urls import path

from .views import (
    UserSelectionView,
    UserSelectionDetailView,
    DailyQuestionView,
    CodeSubmissionView,
    TestCaseView,
    RunCodeView,
)


urlpatterns = [
    path(
        "",
        UserSelectionView.as_view(),
        name="user-selection"
    ),

    path(
        "daily/",
        DailyQuestionView.as_view(),
        name="daily-question"
    ),

    path(
        "submissions/",
        CodeSubmissionView.as_view(),
        name="code-submissions"
    ),

    path(
        "run/",
        RunCodeView.as_view(),
        name="run-code"
    ),

    path(
        "test-cases/",
        TestCaseView.as_view(),
        name="test-cases"
    ),

    path(
        "<int:pk>/",
        UserSelectionDetailView.as_view(),
        name="user-selection-detail"
    ),
]