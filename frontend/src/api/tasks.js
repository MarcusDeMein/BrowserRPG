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

export async function login(username, password) {
  const res = await fetch('/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Неверный логин или пароль')
  return res.json()
}

export async function fetchTasks() {
  const res = await apiFetch('/tasks/')
  if (!res.ok) throw new Error('Ошибка загрузки задач')
  return res.json()
}

export async function createTask(title) {
  const res = await apiFetch('/tasks/', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data?.title?.[0] ?? data?.non_field_errors?.[0] ?? 'Ошибка создания задачи')
  }
  return res.json()
}

export async function patchTask(id, fields) {
  const res = await apiFetch(`/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error('Ошибка обновления задачи')
  return res.json()
}

export async function hideTasks(ids) {
  const res = await apiFetch('/tasks/hide/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Ошибка скрытия задачи')
}
