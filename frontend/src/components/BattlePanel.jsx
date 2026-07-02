import { useRef, useState } from 'react'
import { attackMonster, explore, fetchCharacter } from '../api/characters'

export default function BattlePanel({ character, sceneRef, onCharacterUpdate }) {
  const [encounters, setEncounters] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [log, setLog] = useState([])
  const [attacking, setAttacking] = useState(false)
  const [exploring, setExploring] = useState(false)
  const logId = useRef(0)

  function addLog(msg, type = 'info') {
    setLog(prev => [{ msg, type, id: ++logId.current }, ...prev].slice(0, 40))
  }

  // ── Explore ──
  async function handleExplore() {
    if (encounters.length >= 3) { addLog('Нельзя — уже 3 активных боя', 'error'); return }
    setExploring(true)
    try {
      const data = await explore(character.id)
      if (!data.encounter) {
        addLog(`🌿 ${data.message}`, 'info')
        return
      }
      const monster = {
        name: data.monster_name,
        health: data.monster_health,
        is_boss: data.is_boss,
        level: '?',
      }
      const enc = { encounterId: data.encounter_id, monster, monsterHp: data.monster_health }
      setEncounters(prev => [...prev, enc])
      setActiveId(enc.encounterId)
      sceneRef.current?.spawnMonster(monster, data.monster_health)
      addLog(`${data.is_boss ? '👹 БОСС' : '👾'} ${data.monster_name} вышел из тени!`, 'spawn')
    } catch (err) {
      addLog(err.message, 'error')
    } finally {
      setExploring(false)
    }
  }

  function selectEncounter(enc) {
    setActiveId(enc.encounterId)
    sceneRef.current?.spawnMonster(enc.monster, enc.monsterHp)
  }

  // ── Attack ──
  async function handleAttack() {
    const enc = encounters.find(e => e.encounterId === activeId)
    if (!enc || attacking) return
    setAttacking(true)
    try {
      const data = await attackMonster(character.id, enc.encounterId)

      sceneRef.current?.playAttack(data.damage_dealt, data.monster_health)
      addLog(`⚔ Нанесено ${data.damage_dealt} урона. HP монстра: ${data.monster_health}`, 'attack')

      if (data.monster_defeated) {
        setTimeout(() => sceneRef.current?.playDefeat(), 300)
        addLog(`💀 ${enc.monster.name} повержен!`, 'victory')
        if (data.loot?.length) {
          data.loot.forEach(l => addLog(`🎁 Получено: ${l.item} x${l.quantity}`, 'loot'))
        }
        setEncounters(prev => prev.filter(e => e.encounterId !== activeId))
        setActiveId(null)
        const updated = await fetchCharacter()
        if (updated) onCharacterUpdate(updated)
      } else {
        if (data.damage_taken != null) {
          addLog(`🩸 ${enc.monster.name} наносит ${data.damage_taken} урона. Ваше HP: ${data.character_health}`, 'taken')
          sceneRef.current?.playMonsterAttack(data.damage_taken, data.character_health)
          onCharacterUpdate(prev => ({ ...prev, health: data.character_health }))
        }
        if (data.character_defeated) {
          addLog('💀 Вы пали в бою...', 'defeat')
          sceneRef.current?.playCharacterDefeat()
          setEncounters([])
          setActiveId(null)
          const updated = await fetchCharacter()
          if (updated) onCharacterUpdate(updated)
        } else {
          setEncounters(prev =>
            prev.map(e => e.encounterId === activeId ? { ...e, monsterHp: data.monster_health } : e)
          )
        }
      }
    } catch (err) {
      addLog(err.message, 'error')
    } finally {
      setAttacking(false)
    }
  }

  const activeEnc = encounters.find(e => e.encounterId === activeId)
  const canFight = encounters.length < 3

  return (
    <div className="battle-panel">

      {/* Explore */}
      <div className="bp-section">
        <p className="explore-desc">
          Отправьтесь в путь — с шансом 70% вы встретите монстра, подходящего вашему уровню.
        </p>
        <button
          className="explore-btn"
          onClick={handleExplore}
          disabled={exploring || !canFight}
        >
          {exploring ? <span className="spinner" /> : '🌿 Исследовать'}
        </button>
      </div>

      {/* Active encounters */}
      {encounters.length > 0 && (
        <div className="bp-section">
          <h3 className="bp-title">Активные бои ({encounters.length}/3)</h3>
          <div className="enc-list">
            {encounters.map(enc => (
              <button
                key={enc.encounterId}
                className={`enc-card ${enc.encounterId === activeId ? 'active' : ''}`}
                onClick={() => selectEncounter(enc)}
              >
                <span>{enc.monster.name}</span>
                <span className="enc-hp">HP {enc.monsterHp}/{enc.monster.health}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attack */}
      <button
        className="attack-btn"
        onClick={handleAttack}
        disabled={!activeEnc || attacking}
      >
        {attacking
          ? <span className="spinner" />
          : activeEnc ? `⚔ Атаковать ${activeEnc.monster.name}` : 'Выберите бой'}
      </button>

      {/* Log */}
      <div className="bp-section bp-log-wrap">
        <h3 className="bp-title">Лог</h3>
        <div className="battle-log">
          {log.length === 0
            ? <p className="bp-empty">Здесь будет история боя...</p>
            : log.map(entry => (
              <div key={entry.id} className={`log-entry log-${entry.type}`}>{entry.msg}</div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
