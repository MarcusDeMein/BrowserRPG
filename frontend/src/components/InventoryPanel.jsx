import { useState, useEffect, useCallback } from 'react'
import { fetchInventory, equipItem, unequipItem } from '../api/characters'

const TYPE_ICON  = { weapon: '⚔️', armor: '🛡️', consumable: '🧪' }
const TYPE_LABEL = { weapon: 'Оружие', armor: 'Броня', consumable: 'Расходник' }

export default function InventoryPanel() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(null)

  const load = useCallback(() => {
    fetchInventory().then(setInventory).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle(invItem) {
    setLoading(invItem.id)
    try {
      if (invItem.is_equipped) await unequipItem(invItem.id)
      else await equipItem(invItem.id)
      load()
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  if (inventory.length === 0) {
    return <p className="bp-empty" style={{ padding: '1rem' }}>Инвентарь пуст</p>
  }

  return (
    <div className="inv-grid">
      {inventory.map(invItem => (
        <div key={invItem.id} className={`inv-item ${invItem.is_equipped ? 'equipped' : ''}`}>
          <div className="inv-item-icon">{TYPE_ICON[invItem.item.item_type]}</div>
          <div className="inv-item-info">
            <span className="inv-item-name">{invItem.item.name}</span>
            <span className="inv-item-type">{TYPE_LABEL[invItem.item.item_type]}</span>
            <div className="inv-item-stats">
              {invItem.item.attack_bonus > 0 && (
                <span className="stat-tag atk">⚔ +{invItem.item.attack_bonus}</span>
              )}
              {invItem.item.defense_bonus > 0 && (
                <span className="stat-tag def">🛡 +{invItem.item.defense_bonus}</span>
              )}
            </div>
          </div>
          <div className="inv-item-right">
            {invItem.quantity > 1 && <span className="inv-qty">x{invItem.quantity}</span>}
            {invItem.item.item_type !== 'consumable' && (
              <button
                className={`inv-equip-btn ${invItem.is_equipped ? 'unequip' : ''}`}
                onClick={() => toggle(invItem)}
                disabled={loading === invItem.id}
              >
                {loading === invItem.id
                  ? <span className="spinner-sm" />
                  : invItem.is_equipped ? 'Снять' : 'Надеть'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
