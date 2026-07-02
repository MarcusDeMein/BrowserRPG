import { useState, useEffect } from 'react'
import { fetchMonsters } from '../api/monsters'
import { spawnMonster, attackMonster, fetchCharacter } from '../api/characters'

export default function BattlePanel({ character, sceneRef, onCharacterUpdate }) {
  const [monsters, setMonsters] = useState([])
  const [encounters, setEncounters] = useState([])   // {encounterId, monster, monsterHp}
  const [activeId, setActiveId] = useState(null)
  const [log, setLog] = useState([])
  const [attacking, setAttacking] = useState(false)
  const [spawning, setSpawning] = useState(null)

  useEffect(() => {
    fetchMonsters().then(setMonsters).catch(() => {})
  }, [])

  function addLog(msg, type = 'info') {
    setLog(prev => [{ msg, type, id: Date.now() + Math.random() }, ...prev].slice(0, 30))
  }

  async function handleSpawn(monster) {
    if (encounters.length >= 3) {
      addLog('Нельзя — уже 3 активных боя', 'error')
      return
    }
    setSpawning(monster.id)
    try {
      const data = await spawnMonster(character.id, monster.id)
      const enc = {
        encounterId: data.encounter_id,
        monster,
        monsterHp: data.monster_health,
      }
      setEncounters(prev => [...prev, enc])
      setActiveId(enc.encounterId)
      sceneRef.current?.spawnMonster(monster, data.monster_health)
      addLog(`${monster.name} появился! HP: ${data.monster_health}`, 'spawn')
    } catch (err) {
      addLog(err.message, 'error')
    } finally {
      setSpawning(null)
    }
  }

  function selectEncounter(enc) {
    setActiveId(enc.encounterId)
    sceneRef.current?.spawnMonster(enc.monster, enc.monsterHp)
  }

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
        // Монстр контратакует
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
            prev.map(e =>
              e.encounterId === activeId ? { ...e, monsterHp: data.monster_health } : e
            )
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

  return (
    <div className="battle-panel">

      {/* Monster list */}
      <div className="bp-section">
        <h3 className="bp-title">Монстры</h3>
        <div className="monster-list">
          {monsters.length === 0 && <p className="bp-empty">Загрузка...</p>}
          {monsters.map(m => (
            <button
              key={m.id}
              className={`monster-card ${m.is_boss ? 'boss' : ''}`}
              onClick={() => handleSpawn(m)}
              disabled={spawning === m.id || encounters.length >= 3}
            >
              <span className="mc-icon">{m.is_boss ? '👹' : '👾'}</span>
              <div className="mc-info">
                <span className="mc-name">{m.name}</span>
                <span className="mc-stats">Ур.{m.level} · HP {m.health}</span>
              </div>
              <span className="mc-xp">+{m.experience_reward} XP</span>
              {spawning === m.id && <span className="spinner-sm" />}
            </button>
          ))}
        </div>
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

      {/* Attack button */}
      <button
        className="attack-btn"
        onClick={handleAttack}
        disabled={!activeEnc || attacking}
      >
        {attacking
          ? <span className="spinner" />
          : activeEnc
            ? `⚔ Атаковать ${activeEnc.monster.name}`
            : 'Выберите бой'}
      </button>

      {/* Battle log */}
      <div className="bp-section bp-log-wrap">
        <h3 className="bp-title">Лог боя</h3>
        <div className="battle-log">
          {log.length === 0
            ? <p className="bp-empty">Здесь будет история боя...</p>
            : log.map(entry => (
              <div key={entry.id} className={`log-entry log-${entry.type}`}>
                {entry.msg}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
