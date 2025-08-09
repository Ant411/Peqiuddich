
import React, { useRef, useState, useEffect } from 'react'

function clamp(v,min,max){return Math.max(min, Math.min(max,v))}

function useJoystick(){
  const [vec, setVec] = useState({x:0, y:0, active:false})
  const start = useRef(null)
  function onStart(e){
    const t = e.touches? e.touches[0] : e
    start.current = { x: t.clientX, y: t.clientY }
    setVec(v=>({...v, active:true}))
  }
  function onMove(e){
    if (!start.current) return
    const t = e.touches? e.touches[0] : e
    const dx = clamp((t.clientX - start.current.x)/50, -1, 1)
    const dy = clamp((t.clientY - start.current.y)/50, -1, 1)
    setVec({x:dx,y:dy, active:true})
  }
  function onEnd(){ start.current=null; setVec({x:0,y:0,active:false}) }
  return { vec, onStart, onMove, onEnd }
}

export function TouchControls({ onMoveVec, onLookVec, onGrab, onPinch }){
  const left = useJoystick()
  const right = useJoystick()
  const [pinching, setPinching] = useState(false)
  const pinchRef = useRef({d:0})
  useEffect(()=>{
    const id = setInterval(()=>{
      onMoveVec && onMoveVec(left.vec)
      onLookVec && onLookVec(right.vec)
    }, 16)
    return ()=>clearInterval(id)
  }, [left.vec, right.vec, onMoveVec, onLookVec])

  function onTouchStart(e){
    if (e.touches && e.touches.length===2){
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current.d = Math.hypot(dx,dy)
      setPinching(true)
    }
  }
  function onTouchMove(e){
    if (pinching && e.touches && e.touches.length===2){
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const d = Math.hypot(dx,dy)
      const scale = (d - pinchRef.current.d)/120 // -1..1-ish
      onPinch && onPinch(scale)
    }
  }
  function onTouchEnd(){ setPinching(false) }

  return (
    <div className="center" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="joy-wrap" 
           onTouchStart={left.onStart} onTouchMove={left.onMove} onTouchEnd={left.onEnd}>
        <div className="joy-base"></div>
        <div className="joy-stick" style={{transform:`translate(${left.vec.x*30}px,${left.vec.y*30}px)`}}></div>
      </div>
      <div className="joy-wrap joy-look" 
           onTouchStart={right.onStart} onTouchMove={right.onMove} onTouchEnd={right.onEnd}>
        <div className="joy-base"></div>
        <div className="joy-stick" style={{transform:`translate(${right.vec.x*30}px,${right.vec.y*30}px)`}}></div>
      </div>
      <button className="button btn-grab" onClick={onGrab}>Grab</button>
    </div>
  )
}
