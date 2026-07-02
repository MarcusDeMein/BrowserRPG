from django.db import models

from django.conf import settings

# Create your models here.


class Task(models.Model):
    title = models.CharField(max_length=200)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    show = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']