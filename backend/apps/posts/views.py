from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Post, Category, Tag
from .serializers import PostListSerializer, PostDetailSerializer, CategorySerializer, TagSerializer
from .filters import PostFilter
from core.permissions import IsOwnerOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet handles: list, create, retrieve, update, partial_update, destroy
    All from one class. DRF maps HTTP methods to actions automatically.
    """
    queryset = Post.objects.select_related('author', 'category').prefetch_related('tags')
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = PostFilter
    search_fields = ['title', 'content', 'author__username']
    ordering_fields = ['created_at', 'published_at', 'like_count']
    lookup_field = 'slug'   # use /posts/{slug}/ instead of /posts/{id}/

    def get_queryset(self):
        """
        - Unauthenticated users see only published posts
        - Authenticated users also see their own drafts
        """
        qs = super().get_queryset()
        user = self.request.user

        if user.is_authenticated:
            return qs.filter(Q(status='published') | Q(author=user))
        return qs.filter(status='published')

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        # Automatically set the author to the logged-in user
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_drafts(self, request):
        """GET /api/posts/my-drafts/ — list current user's drafts"""
        drafts = Post.objects.filter(author=request.user, status='draft')
        serializer = PostListSerializer(drafts, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAuthenticated()]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAuthenticated()]