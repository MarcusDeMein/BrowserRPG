import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BattleScene from '../game/BattleScene'

const GAME_W = 600
const GAME_H = 260

export default function GameCanvas({ sceneRef, character }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (gameRef.current) return

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#0d0d14',
      parent: containerRef.current,
      scene: [BattleScene],
      audio: { noAudio: true },
    })

    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current.scene.getScene('BattleScene')
      sceneRef.current = scene
      if (character) scene.setCharacter(character)
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (sceneRef.current && character) {
      sceneRef.current.setCharacter(character)
    }
  }, [character, sceneRef])

  return <div ref={containerRef} className="game-canvas-wrap" />
}
