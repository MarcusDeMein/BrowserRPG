from django.contrib import admin
from .models import Character, Item, InventoryItem, LootDrop, Monster, MonsterInstance

admin.site.register(Character)
admin.site.register(Item)
admin.site.register(InventoryItem)
admin.site.register(Monster)
admin.site.register(LootDrop)
admin.site.register(MonsterInstance)