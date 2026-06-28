from rest_framework import serializers
from .models import Like, Bookmark
from apps.users.serializers import UserProfileSerializer
from apps.posts.serializers import PostListSerializer


class LikeSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class BookmarkSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    post = PostListSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']