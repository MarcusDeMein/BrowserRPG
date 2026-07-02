from rest_framework import mixins, viewsets
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

class TaskViewSet(mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  viewsets.GenericViewSet,):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user, show=True)
    
    @action(detail=False, methods=['post'])
    def hide(self, request):
        ids = request.data.get('ids')

        if not ids or not isinstance(ids, list):
            return Response({"error": "Нужно передать список ids"}, status=400)

        updated_count = Task.objects.filter(
            id__in=ids,
            owner=request.user
        ).update(show=False)

        return Response({"hidden_count": updated_count})