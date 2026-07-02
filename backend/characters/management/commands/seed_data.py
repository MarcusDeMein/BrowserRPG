from django.core.management.base import BaseCommand
from characters.models import Item, Monster, LootDrop


class Command(BaseCommand):
    help = 'Заполняет базу тестовыми предметами, монстрами и лутом'

    def handle(self, *args, **kwargs):
        Item.objects.all().delete()
        Monster.objects.all().delete()
        LootDrop.objects.all().delete()

        sword = Item.objects.create(name="Меч новичка", item_type="weapon", attack_bonus=5)
        axe = Item.objects.create(name="Боевой топор", item_type="weapon", attack_bonus=8)
        staff = Item.objects.create(name="Посох мага", item_type="weapon", attack_bonus=6)
        dagger = Item.objects.create(name="Кинжал разбойника", item_type="weapon", attack_bonus=4)
        legendary_sword = Item.objects.create(name="Клинок дракона", item_type="weapon", attack_bonus=20)

        leather_armor = Item.objects.create(name="Кожаная броня", item_type="armor", defense_bonus=3)
        chain_armor = Item.objects.create(name="Кольчуга", item_type="armor", defense_bonus=6)
        plate_armor = Item.objects.create(name="Латные доспехи", item_type="armor", defense_bonus=10)
        dragon_scale = Item.objects.create(name="Чешуя дракона", item_type="armor", defense_bonus=15)

        health_potion = Item.objects.create(name="Зелье здоровья", item_type="consumable")
        mana_potion = Item.objects.create(name="Зелье маны", item_type="consumable")

        self.stdout.write(self.style.SUCCESS(f'Создано предметов: {Item.objects.count()}'))

        goblin = Monster.objects.create(
            name="Гоблин", level=1, health=30, attack=5, defense=2,
            is_boss=False, experience_reward=20
        )
        wolf = Monster.objects.create(
            name="Дикий волк", level=2, health=45, attack=8, defense=3,
            is_boss=False, experience_reward=35
        )
        bandit = Monster.objects.create(
            name="Разбойник", level=3, health=60, attack=12, defense=5,
            is_boss=False, experience_reward=50
        )
        orc = Monster.objects.create(
            name="Орк-воин", level=5, health=100, attack=18, defense=8,
            is_boss=False, experience_reward=90
        )
        dragon = Monster.objects.create(
            name="Древний дракон", level=20, health=500, attack=50, defense=25,
            is_boss=True, experience_reward=1000
        )

        self.stdout.write(self.style.SUCCESS(f'Создано монстров: {Monster.objects.count()}'))

        LootDrop.objects.create(monster=goblin, item=health_potion, drop_chance=0.5, min_quantity=1, max_quantity=2)
        LootDrop.objects.create(monster=goblin, item=dagger, drop_chance=0.1, min_quantity=1, max_quantity=1)

        LootDrop.objects.create(monster=wolf, item=health_potion, drop_chance=0.4, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=wolf, item=leather_armor, drop_chance=0.15, min_quantity=1, max_quantity=1)

        LootDrop.objects.create(monster=bandit, item=sword, drop_chance=0.2, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=bandit, item=mana_potion, drop_chance=0.3, min_quantity=1, max_quantity=2)

        LootDrop.objects.create(monster=orc, item=axe, drop_chance=0.25, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=orc, item=chain_armor, drop_chance=0.2, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=orc, item=plate_armor, drop_chance=0.05, min_quantity=1, max_quantity=1)

        LootDrop.objects.create(monster=dragon, item=legendary_sword, drop_chance=0.5, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=dragon, item=dragon_scale, drop_chance=0.6, min_quantity=1, max_quantity=1)
        LootDrop.objects.create(monster=dragon, item=health_potion, drop_chance=1.0, min_quantity=3, max_quantity=5)

        self.stdout.write(self.style.SUCCESS(f'Создано записей лута: {LootDrop.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('Готово!'))
