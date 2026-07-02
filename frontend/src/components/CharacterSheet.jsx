import { useState, useEffect, useCallback } from 'react'
import { fetchInventory } from '../api/characters'
import StatBar from './StatBar'
import InventoryPanel from './InventoryPanel'

const CLASS_ICON = { warrior: '⚔️', mage: '🔮', rogue: '🗡️' }
const CLASS_LABEL = { warrior: 'Воин', mage: 'Маг', rogue: 'Плут' }

export default function CharacterSheet({ character, onLogout }) {
  const [inventory, setInventory] = useState([])
  const [tab, setTab] = useState('stats')

  const loadInventory = useCallback(() => {
    fetchInventory().then(setInventory).catch(() => {})
  }, [])

  useEffect(() => { loadInventory() }, [loadInventory])


  return (
    <div className="sheet-page">
      <header className="sheet-header">
        <div className="sheet-header-left">
          <span className="sheet-class-icon">{CLASS_ICON[character.character_class]}</span>
          <div>
            <h1 className="sheet-name">{character.name}</h1>
            <p className="sheet-class">{CLASS_LABEL[character.character_class]} · Уровень {character.level}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Выйти</button>
      </header>

      <div className="xp-section">
        <div className="xp-label">
          <span>Опыт</span>
          <span>{character.experience} XP</span>
        </div>
      </div>

      <div className="sheet-tabs">
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
          Характеристики
        </button>
        <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>
          Инвентарь
          {inventory.length > 0 && <span className="tab-badge">{inventory.length}</span>}
        </button>
      </div>

      <div className="sheet-body">
        {tab === 'stats' && (
          <div className="stats-panel">
            <StatBar label="Здоровье" value={character.health} max={character.health} color="var(--hp)" />
            <StatBar label="Мана"     value={character.mana}   max={character.mana}   color="var(--mp)" />
            <StatBar label="Выносливость" value={character.stamina} max={character.stamina} color="var(--sp)" />

            <div className="stat-grid">
              <div className="stat-chip">
                <span className="stat-chip-label">Уровень</span>
                <span className="stat-chip-value">{character.level}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Опыт</span>
                <span className="stat-chip-value">{character.experience}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Здоровье</span>
                <span className="stat-chip-value">{character.health}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Мана</span>
                <span className="stat-chip-value">{character.mana}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Выносливость</span>
                <span className="stat-chip-value">{character.stamina}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <InventoryPanel inventory={inventory} onInventoryChange={loadInventory} />
        )}
      </div>
    </div>
  )
}
