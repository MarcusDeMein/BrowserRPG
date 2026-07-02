import { getAccess, refreshAccess, clearTokens } from './auth'

async function apiFetch(path, options = {}) {
  const doRequest = (access) =>
    fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
        ...options.headers,
      },
    })

  let res = await doRequest(getAccess())

  if (res.status === 401) {
    try {
      const newAccess = await refreshAccess()
      res = await doRequest(newAccess)
    } catch {
      clearTokens()
      window.location.reload()
      throw new Error('session expired')
    }
  }

  return res
}

export async function fetchCharacter() {
  const res = await apiFetch('/characters/')
  if (!res.ok) throw new Error('Ошибка загрузки персонажа')
  const list = await res.json()
  return list[0] ?? null
}

export async function createCharacter(data) {
  const res = await apiFetch('/characters/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(Object.values(err).flat()[0] ?? 'Ошибка создания персонажа')
  }
  return res.json()
}

export async function explore(characterId) {
  const res = await apiFetch(`/characters/${characterId}/explore/`, { method: 'POST' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Ошибка исследования')
  return data
}

export async function spawnMonster(characterId, monsterId) {
  const res = await apiFetch(`/characters/${characterId}/spawn_monster/`, {
    method: 'POST',
    body: JSON.stringify({ monster_id: monsterId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Ошибка спавна монстра')
  return data
}

export async function attackMonster(characterId, encounterId) {
  const res = await apiFetch(`/characters/${characterId}/attack_monster/`, {
    method: 'POST',
    body: JSON.stringify({ encounter_id: encounterId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Ошибка атаки')
  return data
}

export async function fetchInventory() {
  const res = await apiFetch('/inventory/')
  if (!res.ok) throw new Error('Ошибка загрузки инвентаря')
  return res.json()
}

export async function equipItem(id) {
  const res = await apiFetch('/inventory/equip/', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Ошибка экипировки')
  return res.json()
}

export async function unequipItem(id) {
  const res = await apiFetch('/inventory/unequip/', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Ошибка снятия предмета')
  return res.json()
}
