import { useState } from 'react'
import { createCharacter } from '../api/characters'

const CLASSES = [
  {
    value: 'warrior',
    label: 'Воин',
    icon: '⚔️',
    desc: 'Мастер ближнего боя. Высокий запас здоровья и стойкость в битве.',
  },
  {
    value: 'mage',
    label: 'Маг',
    icon: '🔮',
    desc: 'Повелитель магии. Огромная мана и разрушительные заклинания.',
  },
  {
    value: 'rogue',
    label: 'Плут',
    icon: '🗡️',
    desc: 'Тень и клинок. Скорость, скрытность и точные удары.',
  },
]

export default function CreateCharacter({ onCreate }) {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedClass) { setError('Выберите класс персонажа'); return }
    setError('')
    setLoading(true)
    try {
      const char = await createCharacter({ name, character_class: selectedClass })
      onCreate(char)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cc-overlay">
      <div className="cc-card">
        <div className="cc-header">
          <span className="cc-rune">᚛</span>
          <h2>Создать персонажа</h2>
          <p>Выберите имя и путь своего героя</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cc-field">
            <label>Имя героя</label>
            <input
              type="text"
              placeholder="Введите имя..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="cc-classes">
            {CLASSES.map(cls => (
              <button
                type="button"
                key={cls.value}
                className={`cc-class-btn ${selectedClass === cls.value ? 'selected' : ''}`}
                onClick={() => setSelectedClass(cls.value)}
              >
                <span className="cc-class-icon">{cls.icon}</span>
                <span className="cc-class-name">{cls.label}</span>
                <span className="cc-class-desc">{cls.desc}</span>
              </button>
            ))}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="cc-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Начать приключение'}
          </button>
        </form>
      </div>
    </div>
  )
}
