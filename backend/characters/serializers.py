from rest_framework import serializers
from .models import Item, InventoryItem, Character, Monster

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'item_type', 'attack_bonus', 'defense_bonus']

class MonsterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Monster
        fields = ['id', 'name', 'level', 'health', 'attack', 'defense', 'is_boss', 'experience_reward']


class InventoryItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'character', 'item', 'quantity', 'is_equipped']

class CharacterSerializer(serializers.ModelSerializer):
    inventory    = InventoryItemSerializer(many=True, read_only=True)
    user         = serializers.PrimaryKeyRelatedField(read_only=True)
    max_health   = serializers.SerializerMethodField()
    attack_power = serializers.SerializerMethodField()
    defense_power= serializers.SerializerMethodField()
    required_exp = serializers.SerializerMethodField()

    class Meta:
        model = Character
        fields = [
            'id', 'user', 'name', 'character_class',
            'level', 'experience', 'required_exp',
            'health', 'max_health',
            'mana', 'stamina',
            'attack_power', 'defense_power',
            'inventory',
        ]

    def get_max_health(self, obj):
        return obj.get_max_health()

    def get_attack_power(self, obj):
        return obj.get_attack_power()

    def get_defense_power(self, obj):
        return obj.get_defense_power()

    def get_required_exp(self, obj):
        return obj.get_required_exp(obj.level)
