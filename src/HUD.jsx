
import React from 'react'
import { useGame } from '../state/game'

export default function HUD({ info }){
  const {score, round, hiScore, timeLeft, phase} = useGame()
  return (
    <div className="hud">
      <div className="scoreboard">
        <div className="badge">Round: {round}</div>
        <div className="badge">Score: {score}</div>
        <div className="badge">High: {hiScore}</div>
        <div className="badge">Phase: {phase}</div>
        {phase==='BONUS' && <div className="badge">Bonus: {timeLeft}s (15s)</div>}
      </div>
      <div style={{alignSelf:'center'}} className="card" aria-live="polite">{info}</div>
    </div>
  )
}
