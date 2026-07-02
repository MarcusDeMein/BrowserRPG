import { useState, useEffect } from 'react'
import { saveTokens, clearTokens, getAccess } from './api/auth'
import { fetchCharacter } from './api/characters'
import LoginForm from './components/LoginForm'
import CreateCharacter from './components/CreateCharacter'
import GameView from './components/GameView'

export default function App() {
  const [loggedIn, setLoggedIn]   = useState(() => !!getAccess())
  const [character, setCharacter] = useState(null)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!loggedIn) return
    setLoading(true)
    fetchCharacter()
      .then(setCharacter)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [loggedIn])

  function handleLogin(tokens) {
    saveTokens(tokens)
    setLoggedIn(true)
  }

  function handleLogout() {
    clearTokens()
    setLoggedIn(false)
    setCharacter(null)
  }

  if (!loggedIn) return <LoginForm onLogin={handleLogin} />

  if (loading) return (
    <div className="fullscreen-loader">
      <span className="rune-spin">᛭</span>
    </div>
  )

  if (!character) return <CreateCharacter onCreate={setCharacter} />

  return <GameView character={character} onLogout={handleLogout} />
}
