
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function Fireworks({ origin = [0,1.2,0], count = 80, onDone }) {
  const refs = useRef([])
  const t0 = useRef(0)
  const done = useRef(false)
  const velocities = useMemo(() => {
    const v=[]; for(let i=0;i<count;i++){ 
      const dir = new THREE.Vector3((Math.random()-0.5),(Math.random()-0.1),(Math.random()-0.5)).normalize()
      v.push(dir.multiplyScalar( (0.6+Math.random()*1.4) ))
    } return v
  }, [count])
  useFrame((state, dt)=>{
    if (!t0.current) t0.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - t0.current
    for (let i=0;i<refs.current.length;i++){
      const p = refs.current[i]
      if (!p) continue
      p.position.x = origin[0] + velocities[i].x * t * 2
      p.position.y = origin[1] + velocities[i].y * t * 2 - 0.9*t*t
      p.position.z = origin[2] + velocities[i].z * t * 2
      const fade = Math.max(0, 1 - t/1.2)
      p.material.opacity = fade
      p.material.needsUpdate = true
    }
    if (t>1.3 && !done.current){ done.current=true; onDone && onDone() }
  })
  return (
    <group>
      {Array.from({length:count}).map((_,i)=>(
        <mesh key={i} ref={el=>refs.current[i]=el} position={origin}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={new THREE.Color().setHSL(Math.random(),0.8,0.6)} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  )
}
