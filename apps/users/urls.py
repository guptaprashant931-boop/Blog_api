from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LogoutView, MeView, PublicProfileView, ChangePasswordView

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/password/change/', ChangePasswordView.as_view(), name='change_password'),

    # Profile
    path('users/me/', MeView.as_view(), name='me'),
    path('users/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
]