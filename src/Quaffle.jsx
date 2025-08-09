
import React from 'react'
export default function Quaffle(){
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshStandardMaterial color="#7a2f26" roughness={0.8} metalness={0.05} />
    </mesh>
  )
}
