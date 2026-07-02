import { useState, useEffect } from 'react'
import { fetchTasks, createTask } from '../api/tasks'
import TaskCard from './TaskCard'

export default function TaskList({ onLogout }) {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const task = await createTask(newTitle)
      setTasks(prev => [task, ...prev])
      setNewTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  function handleUpdate(updated) {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  function handleHide(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const done = tasks.filter(t => t.is_done).length

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <h1 className="header-title">Мои задачи</h1>
            {!loading && (
              <p className="header-sub">{done} из {tasks.length} выполнено</p>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>Выйти</button>
        </header>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Что нужно сделать?"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
          />
          <button type="submit" disabled={adding}>
            {adding ? (
              <span className="spinner" />
            ) : (
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <line x1="7" y1="1" x2="7" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="1" y1="7" x2="13" y2="7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <div className="skeletons">
            {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">✓</span>
            <p>Нет активных задач</p>
          </div>
        ) : (
          <div className="tasks">
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onHide={handleHide}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
