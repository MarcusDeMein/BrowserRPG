import StatBar from './StatBar'

const CLASS_LABEL = { warrior: 'Воин', mage: 'Маг', rogue: 'Плут' }
const CLASS_ICON  = { warrior: '⚔️',  mage: '🔮',  rogue: '🗡️' }

export default function CharacterPanel({ character }) {
  const xpPct = Math.min(100, Math.round((character.experience / character.required_exp) * 100))

  return (
    <div className="char-panel">
      <div className="char-panel-header">
        <span className="char-panel-icon">{CLASS_ICON[character.character_class]}</span>
        <div>
          <div className="char-panel-name">{character.name}</div>
          <div className="char-panel-class">{CLASS_LABEL[character.character_class]}</div>
        </div>
        <div className="char-panel-level">Ур.{character.level}</div>
      </div>

      <div className="xp-bar-wrap">
        <div className="xp-bar-labels">
          <span>Опыт</span>
          <span>{character.experience} / {character.required_exp} XP</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="char-stats">
        <StatBar label="Здоровье"     value={character.health}  max={character.max_health} color="var(--hp)" />
        <StatBar label="Мана"         value={character.mana}    max={character.mana}       color="var(--mp)" />
        <StatBar label="Выносливость" value={character.stamina} max={character.stamina}    color="var(--sp)" />
      </div>

      <div className="char-chips">
        <div className="chip"><span>Атака</span><strong>{character.attack_power}</strong></div>
        <div className="chip"><span>Защита</span><strong>{character.defense_power}</strong></div>
      </div>
    </div>
  )
}
