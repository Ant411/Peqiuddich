
import React from 'react'
export default function Bludger(){
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.24, 24, 24]} />
      <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.3} />
    </mesh>
  )
}
