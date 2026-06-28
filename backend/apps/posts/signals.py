from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Post
from core.utils import unique_slug


@receiver(pre_save, sender=Post)
def set_slug_and_published_at(sender, instance, **kwargs):
    """
    Before every save:
    1. If no slug yet, generate one from the title.
    2. If status just changed to 'published', set published_at.
    """
    if not instance.slug:
        instance.slug = unique_slug(Post, instance.title)

    if instance.status == Post.Status.PUBLISHED and not instance.published_at:
        instance.published_at = timezone.now()