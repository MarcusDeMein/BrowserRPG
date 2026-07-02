# BrowserRPG

A turn-based browser RPG with character progression, inventory, combat, and loot. Backend built with Django REST Framework, frontend with React.

## Tech Stack

**Backend:**
- Python 3.11, Django, Django REST Framework
- JWT authentication (djangorestframework-simplejwt)
- SQLite (development) / PostgreSQL (production)

**Frontend:**
- React
- (add here if used — e.g. "Phaser 3 for the game scene")

## Features

- User registration and JWT-based authentication
- Character creation with class selection (Warrior / Mage / Rogue), affecting combat stats
- Inventory system: equip weapons/armor with automatic replacement of same-type items
- Level progression with a non-linear experience curve
- Turn-based combat with server-side damage calculation (prevents client-side tampering)
- Loot drop system with configurable drop chances
- Role-based access control (regular user / admin)

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate        # macOS/Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py seed_data      # populate test items and monsters
python manage.py createsuperuser

python manage.py runserver
```

Backend available at `http://127.0.0.1:8000/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:3000/`

## API Endpoints

### Authentication
| Method | URL | Description |
|---|---|---|
| POST | `/api/token/` | Obtain JWT token (login) |
| POST | `/api/token/refresh/` | Refresh access token |

### Character
| Method | URL | Description |
|---|---|---|
| GET | `/api/characters/` | Get your character |
| POST | `/api/characters/` | Create a character |
| POST | `/api/characters/<id>/explore/` | Explore the area (chance to encounter a monster) |
| POST | `/api/characters/<id>/attack_monster/` | Attack the monster in the current encounter |

### Inventory
| Method | URL | Description |
|---|---|---|
| GET | `/api/inventory/` | List character's items |
| POST | `/api/inventory/equip/` | Equip an item |
| POST | `/api/inventory/unequip/` | Unequip an item |

## Architecture

```
backend/
├── config/          # project settings, root urls.py
├── tasks/            # (describe if kept — otherwise remove this line)
└── characters/        # core RPG app
    ├── models.py       # Character, Item, InventoryItem, Monster, MonsterInstance, LootDrop
    ├── serializers.py
    ├── views.py         # ViewSets + custom actions (explore, attack_monster, equip)
    └── management/commands/seed_data.py
```

## Roadmap

- [ ] Docker setup for deployment
- [ ] Tests (pytest)
- [ ] Deploy to Railway/Render
- [ ] Boss encounters with unique mechanics

## Author

Darkhan — [GitHub](https://github.com/MarcusDeMein)
