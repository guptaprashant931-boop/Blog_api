from rest_framework import serializers
from .models import Comment
from apps.users.serializers import UserProfileSerializer


class ReplySerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'body', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)   # nested replies

    class Meta:
        model = Comment
        fields = ['id', 'author', 'parent', 'body', 'replies', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

    def validate_parent(self, value):
        """
        Ensure you can only reply to a top-level comment,
        not to a reply (max 2 levels deep).
        """
        if value and value.parent is not None:
            raise serializers.ValidationError('You can only reply to top-level comments.')
        return value