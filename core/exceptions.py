from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    """
    Wraps all error responses in a consistent format:
    { "error": true, "message": "...", "details": {...} }
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'error': True,
            'message': str(exc),
            'details': response.data,
        }

    return response