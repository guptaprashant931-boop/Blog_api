from django.urls import path
from .views import LikeToggleView, BookmarkToggleView, MyBookmarksView

urlpatterns = [
    path('posts/<slug:slug>/like/', LikeToggleView.as_view(), name='like_toggle'),
    path('posts/<slug:slug>/bookmark/', BookmarkToggleView.as_view(), name='bookmark_toggle'),
    path('users/me/bookmarks/', MyBookmarksView.as_view(), name='my_bookmarks'),
]