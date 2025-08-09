
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Wing({ side=1 }){
  const ref = useRef()
  useFrame(({clock})=>{
    const t = clock.getElapsedTime()
    const flap = Math.sin(t*16)*0.6 + 0.4
    ref.current.rotation.z = side * (0.4 + flap)
  })
  return (
    <mesh ref={ref} position={[side*0.55,0,0]} castShadow>
      <boxGeometry args={[1.0, 0.06, 0.2]} />
      <meshStandardMaterial color="#d9d9d9" metalness={0.6} roughness={0.2} />
    </mesh>
  )
}
export default function Snitch(){
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.18,32,32]} />
        <meshStandardMaterial color="#e5b100" metalness={0.9} roughness={0.25} emissive="#6d5200" emissiveIntensity={0.2} />
      </mesh>
      <Wing side={1}/><Wing side={-1}/>
    </group>
  )
}
