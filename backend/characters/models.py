import random

from django.db import models
from django.conf import settings

CLASS_MODIFIERS = {
    'warrior': {'attack_mult': 1.2, 'defense_mult': 1.3},
    'mage': {'attack_mult': 1.5, 'defense_mult': 0.8},
    'rogue': {'attack_mult': 1.3, 'defense_mult': 0.9},
}

class Character(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    character_class = models.CharField(
        max_length=20,
        choices=[('warrior', 'Warrior'), ('mage', 'Mage'), ('rogue', 'Rogue')]
    )
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    health = models.IntegerField(default=100)
    mana = models.IntegerField(default=50)
    stamina = models.IntegerField(default=50)

    def get_required_exp(self, level):
        base_slope = 100

        if level < 200:
            return base_slope * level

        elif level < 500:
            value_at_200 = base_slope * 200
            slope = base_slope * 2
            return value_at_200 + slope * (level - 200)

        else:
            value_at_500 = base_slope * 200 + (base_slope * 2) * (500 - 200)
            slope = base_slope * 5
            return value_at_500 + slope * (level - 500)

    def gain_experience(self, amount):
        self.experience += amount
        while self.experience >= self.get_required_exp(self.level):
            self.experience -= self.get_required_exp(self.level)
            self.level += 1
            self.health += 10
            self.mana += 5
            self.stamina += 5
        self.save()

    def get_attack_power(self):
        base_attack = 10
        weapon = self.inventory.filter(is_equipped=True, item__item_type='weapon').first()
        armor = self.inventory.filter(is_equipped=True, item__item_type='armor').first()
        weapon_bonus = weapon.item.attack_bonus if weapon else 0
        armor_bonus = weapon.item.attack_bonus if armor else 0

        mult = CLASS_MODIFIERS[self.character_class]['attack_mult']
        return int((base_attack + weapon_bonus + armor_bonus) * mult)

    def get_defense_power(self):
        base_defense = 5
        armor = self.inventory.filter(is_equipped=True, item__item_type='armor').first()
        weapon = self.inventory.filter(is_equipped=True, item__item_type='weapon').first()
        armor_bonus = armor.item.defense_bonus if armor else 0
        weapon_bonus = weapon.item.defense_bonus if weapon else 0

        mult = CLASS_MODIFIERS[self.character_class]['defense_mult']
        return int((base_defense + armor_bonus + weapon_bonus) * mult)
        

    def __str__(self):
        return f"{self.name} (Lvl {self.level} {self.character_class})"

class Item(models.Model):
    ITEM_TYPES = [
        ('weapon', 'Weapon'),
        ('armor', 'Armor'),
        ('consumable', 'Consumable'),
    ]
    name = models.CharField(max_length=100)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    attack_bonus = models.IntegerField(default=0)
    defense_bonus = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    character = models.ForeignKey(Character, on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    is_equipped = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.character.name} - {self.item.name} x{self.quantity}"

class Monster(models.Model):
    name = models.CharField(max_length=100)
    level = models.IntegerField(default=1)
    health = models.IntegerField(default=50)
    attack = models.IntegerField(default=10)
    defense = models.IntegerField(default=5)
    is_boss = models.BooleanField(default=False)
    experience_reward = models.IntegerField(default=20)


    def roll_loot(self):
        dropped_items = []
        for drop in self.loot_table.all():
            if random.random() <= drop.drop_chance:
                quantity = random.randint(drop.min_quantity, drop.max_quantity)
                dropped_items.append({'item': drop.item, 'quantity': quantity})
        return dropped_items

    def __str__(self):
        return f"{'[BOSS] ' if self.is_boss else ''}{self.name} (Lvl {self.level})"
    
class MonsterInstance(models.Model):
    monster = models.ForeignKey(Monster, on_delete=models.CASCADE)
    character = models.ForeignKey(Character, on_delete=models.CASCADE, related_name='monster_encounters')
    current_health = models.IntegerField()
    is_defeated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.monster.name} vs {self.character.name}"
    
class LootDrop(models.Model):
    monster = models.ForeignKey(Monster, on_delete=models.CASCADE, related_name='loot_table')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    drop_chance = models.FloatField(default=0.1)   # 0.1 = 10% шанс
    min_quantity = models.IntegerField(default=1)
    max_quantity = models.IntegerField(default=1)