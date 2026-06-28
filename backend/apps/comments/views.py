from rest_framework import generics, permissions
from .models import Comment
from .serializers import CommentSerializer
from apps.posts.models import Post
from core.permissions import IsOwnerOrReadOnly


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/posts/{slug}/comments/   -> list comments for a post
    POST /api/posts/{slug}/comments/   -> add a comment
    """
    serializer_class = CommentSerializer

    def get_queryset(self):
        # Only return top-level comments; replies are nested inside them
        post = Post.objects.get(slug=self.kwargs['slug'])
        return Comment.objects.filter(post=post, parent=None).select_related('author')

    def perform_create(self, serializer):
        post = Post.objects.get(slug=self.kwargs['slug'])
        serializer.save(author=self.request.user, post=post)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PATCH  /api/posts/{slug}/comments/{id}/
    DELETE /api/posts/{slug}/comments/{id}/
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = Comment.objects.all()