export function saveTokens({ access, refresh }) {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export function getAccess() {
  return localStorage.getItem('access') ?? ''
}

export function getRefresh() {
  return localStorage.getItem('refresh') ?? ''
}

export async function refreshAccess() {
  const refresh = getRefresh()
  if (!refresh) throw new Error('no refresh token')

  const res = await fetch('/api/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) throw new Error('refresh failed')

  const data = await res.json()
  localStorage.setItem('access', data.access)
  return data.access
}
