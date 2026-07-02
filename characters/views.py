from rest_framework import  viewsets
from .models import Character, Item, InventoryItem, Monster
from .serializers import CharacterSerializer, InventoryItemSerializer, ItemSerializer, MonsterSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Character, Item, InventoryItem, Monster, MonsterInstance

class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def spawn_monster(self, request, pk=None):
        character = self.get_object()
        monster_id = request.data.get('monster_id')
        monster = Monster.objects.filter(id=monster_id).first()

        if monster is None:
            return Response({"error": "Монстр не найден"}, status=404)

        active_count = MonsterInstance.objects.filter(
            character=character,
            is_defeated=False
        ).count()

        if active_count >= 3:
            return Response(
                {"error": "Слишком много активных боёв"},
                status=400
            )

        instance = MonsterInstance.objects.create(
            monster=monster,
            character=character,
            current_health=monster.health
        )
        return Response({"encounter_id": instance.id, "monster_health": instance.current_health})

    @action(detail=True, methods=["post"])
    def attack_monster(self, request, pk=None):
        attacker = self.get_object()
        encounter_id = request.data.get('encounter_id')

        encounter = MonsterInstance.objects.filter(
            id=encounter_id,
            character=attacker,
            is_defeated=False
        ).first()

        if encounter is None:
            return Response({"error": "Бой не найден или уже завершён"}, status=404)

        damage_to_monster = max(attacker.get_attack_power() - encounter.monster.defense, 1)
        encounter.current_health -= damage_to_monster

        response_data = {
            "damage_dealt": damage_to_monster,
            "monster_health": encounter.current_health,
        }

        if encounter.current_health <= 0:
            encounter.is_defeated = True
            attacker.gain_experience(encounter.monster.experience_reward)
            loot = encounter.monster.roll_loot()
            for drop in loot:
                inventory_item, created = InventoryItem.objects.get_or_create(
                    character=attacker, item=drop['item'],
                    defaults={'quantity': drop['quantity']}
                )
                if not created:
                    inventory_item.quantity += drop['quantity']
                    inventory_item.save()
            response_data["monster_defeated"] = True
            response_data["loot"] = [{"item": d['item'].name, "quantity": d['quantity']} for d in loot]
        else:
            damage_to_character = max(encounter.monster.attack - attacker.get_defense_power(), 1)
            attacker.health -= damage_to_character
            response_data["damage_taken"] = damage_to_character
            response_data["character_health"] = attacker.health

            if attacker.health <= 0:
                attacker.health = 0
                response_data["character_defeated"] = True
                # TODO: решить, что происходит при поражении — respawn, штраф опыта, и т.д.

            attacker.save()

        encounter.save()
        return Response(response_data)
    
class MonsterViewSet (viewsets.ModelViewSet):
    queryset = Monster.objects.all()
    serializer_class = MonsterSerializer 
    permission_classes = [IsAuthenticated]

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InventoryItem.objects.filter(character__user=self.request.user)
    
    def perform_create(self, serializer):
        character = Character.objects.get(user=self.request.user)
        serializer.save(character=character)

    @action(detail=False, methods=["post"])
    def equip(self, request):
        item_id = request.data.get('id')

        if not item_id:
            return Response({"error": "Нужно передать id"}, status=400)

        inventory_item = InventoryItem.objects.filter(
            id=item_id,
            character__user=request.user
        ).first()

        if inventory_item is None:
            return Response({"error": "Предмет не найден"}, status=404)

        item_type = inventory_item.item.item_type

        InventoryItem.objects.filter(
            character=inventory_item.character,
            item__item_type=item_type,
            is_equipped=True
        ).update(is_equipped=False)

        inventory_item.is_equipped = True
        inventory_item.save()

        return Response({"equipped": True})
    @action(detail=False, methods=["post"])
    def unequip (self, request):
        id = request.data.get('id')

        if not id:
            return Response({"error": "Нужно передать id"}, status=400)

        updated_count = InventoryItem.objects.filter(
            id=id,
            character__user=request.user
        ).update(is_equipped=False)

        return Response({"hidden_count": updated_count})
