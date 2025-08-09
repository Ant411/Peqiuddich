
import React from 'react'

export default function Help({ onClose }){
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', color:'#fff', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div style={{maxWidth:560, width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:16, padding:16, lineHeight:1.4}}>
        <h2 style={{marginTop:0}}>How to Play — Peqiuddich</h2>
        <ul>
          <li><b>Goal:</b> Chase and catch the <i>Golden Snitch</i>. When caught, enjoy fireworks and a short “caught cage” moment, then enter the Bonus Round.</li>
          <li><b>Controls (Android):</b> Left joystick = move. Right joystick = look. <b>Pinch</b> to adjust speed. (A “Grab” button is reserved for future snare mechanics.)</li>
          <li><b>Catch Range:</b> Get within ~0.6 m of the Snitch to catch it.</li>
          <li><b>Bonus Round (15s):</b> Catch the <i>Quaffle</i> (+10) and dodge/catch <i>Bludgers</i> (+20). Bonus resets every round.</li>
          <li><b>Scoring:</b> Snitch +50, Quaffle +10, Bludger +20. High score is saved on your device.</li>
          <li><b>Levels:</b> Each new round nudges difficulty up (speed/acceleration). Keep going to climb the leaderboard.</li>
          <li><b>Tip:</b> Corners and pillars let the Snitch duck and hide. Track its sound and re‑acquire visually.</li>
        </ul>
        <p style={{opacity:.8, fontSize:12}}>Note: This is a simulator preview. True AR occlusion and real‑room depth come in the native AR build.</p>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
