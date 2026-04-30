from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.posts.models import Post
from .models import Like, Bookmark
from apps.posts.serializers import PostListSerializer


class LikeToggleView(APIView):
    """
    POST /api/posts/{slug}/like/
    If user already liked -> unlike.
    If user hasn't liked  -> like.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = Post.objects.get(slug=slug)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            like.delete()
            return Response({'liked': False, 'like_count': post.like_count})

        return Response({'liked': True, 'like_count': post.like_count})


class BookmarkToggleView(APIView):
    """
    POST /api/posts/{slug}/bookmark/
    Same toggle pattern as Like.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = Post.objects.get(slug=slug)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)

        if not created:
            bookmark.delete()
            return Response({'bookmarked': False})

        return Response({'bookmarked': True})


class MyBookmarksView(APIView):
    """
    GET /api/users/me/bookmarks/
    Lists all posts the current user has bookmarked.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookmarked_posts = Post.objects.filter(bookmarks__user=request.user)
        serializer = PostListSerializer(bookmarked_posts, many=True)
        return Response(serializer.data)