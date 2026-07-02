from rest_framework.routers import DefaultRouter
from .views import CharacterViewSet, InventoryItemViewSet, MonsterViewSet

router = DefaultRouter()
router.register('characters', CharacterViewSet)
router.register('inventory', InventoryItemViewSet)
router.register('monsters', MonsterViewSet)
urlpatterns = router.urls