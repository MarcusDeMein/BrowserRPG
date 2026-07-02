import { getAccess, refreshAccess, clearTokens } from './auth'

async function apiFetch(path) {
  const doRequest = (access) =>
    fetch(`/api${path}`, {
      headers: { Authorization: `Bearer ${access}` },
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

export async function fetchMonsters() {
  const res = await apiFetch('/monsters/')
  if (!res.ok) throw new Error('Ошибка загрузки монстров')
  return res.json()
}
