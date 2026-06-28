from rest_framework import serializers
from .models import Post, Category, Tag
from apps.users.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class PostListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list view — no full content.
    """
    author = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'author', 'category', 'tags',
            'status', 'like_count', 'comment_count', 'published_at', 'created_at'
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for single post — includes content.
    """
    author = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source='tags', many=True, write_only=True, required=False
    )

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'author',
            'category', 'category_id',
            'tags', 'tag_ids',
            'status', 'like_count', 'comment_count',
            'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'author', 'published_at', 'created_at', 'updated_at']