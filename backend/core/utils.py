from django.utils.text import slugify
import uuid

def unique_slug(model_class, title):
    """
    Generates a slug from title. If slug already exists,
    appends a short UUID to make it unique.
    Example: 'my-post', 'my-post-3f2a'
    """
    base_slug = slugify(title)
    slug = base_slug
    while model_class.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
    return slug