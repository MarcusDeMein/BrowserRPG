import { useState } from 'react'
import { patchTask, hideTasks } from '../api/tasks'

export default function TaskCard({ task, onUpdate, onHide, index }) {
  const [hiding, setHiding] = useState(false)

  async function toggleDone() {
    try {
      const updated = await patchTask(task.id, { is_done: !task.is_done })
      onUpdate(updated)
    } catch {
      // ignore
    }
  }

  async function hide() {
    setHiding(true)
    setTimeout(async () => {
      try {
        await hideTasks([task.id])
        onHide(task.id)
      } catch {
        setHiding(false)
      }
    }, 350)
  }

  return (
    <div
      className={`task-card ${task.is_done ? 'done' : ''} ${hiding ? 'hiding' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <label className="task-check">
        <input type="checkbox" checked={task.is_done} onChange={toggleDone} />
        <span className="custom-checkbox">
          <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,5 4,9 11,1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="task-title">{task.title}</span>
      </label>
      <div className="task-meta">
        <span className="task-date">
          {new Date(task.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
        <button className="task-hide" onClick={hide} title="Скрыть">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
