from django.urls import path
from .views import DashboardView
from .views import (
    AdminDashboardView,
    AdminUsersView,
    AdminUserDetailView,
)
urlpatterns=[
    path(
        "",
        DashboardView.as_view(),
        name="dashboard",
    ),
    path(
    "admin/dashboard/",
    AdminDashboardView.as_view(),
    name="admin-dashboard",
),

path(
    "admin/users/",
    AdminUsersView.as_view(),
    name="admin-users",
),

path(
    "admin/users/<int:user_id>/",
    AdminUserDetailView.as_view(),
    name="admin-user-detail",
),
]