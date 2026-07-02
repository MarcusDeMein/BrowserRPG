import { useRef, useState } from 'react'
import GameCanvas from './GameCanvas'
import CharacterPanel from './CharacterPanel'
import BattlePanel from './BattlePanel'
import InventoryPanel from './InventoryPanel'

export default function GameView({ character: initialChar, onLogout }) {
  const sceneRef = useRef(null)
  const [character, setCharacter] = useState(initialChar)
  const [tab, setTab] = useState('battle')

  function updateCharacter(updated) {
    setCharacter(prev => typeof updated === 'function' ? updated(prev) : updated)
  }

  return (
    <div className="game-root">

      <header className="game-topbar">
        <span className="topbar-title">⚔ RPG</span>
        <div className="topbar-center">
          <span className="topbar-char">{character.name}</span>
          <span className="topbar-level">Ур. {character.level}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Выйти</button>
      </header>

      <div className="game-layout">

        <aside className="game-left">
          <CharacterPanel character={character} />
        </aside>

        <main className="game-center">
          <GameCanvas sceneRef={sceneRef} character={character} />

          <div className="center-tabs">
            <button className={tab === 'battle' ? 'active' : ''} onClick={() => setTab('battle')}>
              Битва
            </button>
            <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>
              Инвентарь
            </button>
          </div>

          <div className="center-body">
            {tab === 'battle' && (
              <BattlePanel
                character={character}
                sceneRef={sceneRef}
                onCharacterUpdate={updateCharacter}
              />
            )}
            {tab === 'inventory' && <InventoryPanel />}
          </div>
        </main>

      </div>
    </div>
  )
}
