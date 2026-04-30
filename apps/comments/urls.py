from django.urls import path
from .views import CommentListCreateView, CommentDetailView

urlpatterns = [
    path('posts/<slug:slug>/comments/', CommentListCreateView.as_view(), name='comments'),
    path('posts/<slug:slug>/comments/<uuid:pk>/', CommentDetailView.as_view(), name='comment_detail'),
]