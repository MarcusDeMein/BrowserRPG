from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "is_done", "created_at"]

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Название должно быть минимум 3 символа")
        return value
    
    def validate(self, data):
        if self.instance is None and data.get('is_done'):
            raise serializers.ValidationError("Задача не может быть выполненной при созданий")
        return data
