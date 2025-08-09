
import React, { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import Snitch from './models/Snitch.jsx'
import Quaffle from './models/Quaffle.jsx'
import Bludger from './models/Bludger.jsx'
import HUD from './components/HUD.jsx'
import Help from './components/Help.jsx'
import { TouchControls } from './controls/TouchControls.jsx'
import { useGame } from './state/game.js'
import Fireworks from './effects/Fireworks.jsx'
import { SnitchAI } from './ai/SnitchAI.js'
import { SteeringBall } from './ai/BallAI.js'
import { getListener, createBuffers, attachPositional } from './audio/sound.js'

function Room(){
  const wallMat = useMemo(()=> new THREE.MeshStandardMaterial({ color: '#8090a0' }),[])
  const occMat  = useMemo(()=> new THREE.MeshStandardMaterial({ color: '#5c6a78' }),[])
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[20,20]}/>
        <meshStandardMaterial color="#2b2f34"/>
      </mesh>
      <mesh position={[0,1.5,-6]} castShadow receiveShadow>
        <boxGeometry args={[14,3,0.2]}/>
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[-7,1.5,0]} rotation={[0,Math.PI/2,0]} castShadow receiveShadow>
        <boxGeometry args={[12,3,0.2]}/>
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[7,1.5,0]} rotation={[0,Math.PI/2,0]} castShadow receiveShadow>
        <boxGeometry args={[12,3,0.2]}/>
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0,1,0]} castShadow receiveShadow>
        <boxGeometry args={[1.1,2,1.1]}/>
        <primitive object={occMat} attach="material" />
      </mesh>
      <mesh position={[3.5,1.5,3]} castShadow receiveShadow>
        <boxGeometry args={[4,3,2]}/>
        <primitive object={occMat} attach="material" />
      </mesh>
      <group position={[-4,0,3]}>
        <mesh position={[0,1.5,0]} castShadow receiveShadow>
          <boxGeometry args={[0.2,3,3]} />
          <primitive object={occMat} attach="material" />
        </mesh>
        <mesh position={[2.5,1.5,0]} castShadow receiveShadow>
          <boxGeometry args={[0.2,3,3]} />
          <primitive object={occMat} attach="material" />
        </mesh>
        <mesh position={[1.25,2.9,0]} castShadow receiveShadow>
          <boxGeometry args={[2.7,0.2,3]} />
          <primitive object={occMat} attach="material" />
        </mesh>
      </group>
    </group>
  )
}

function PlayerRig({ onCatch, snitchRef, obstaclesRef }){
  const { camera, scene } = useThree()
  const { phase, addScore, setPhase, enterBonus, tick } = useGame()
  const velocity = useRef(new THREE.Vector3())
  const yaw = useRef(0); const pitch = useRef(0)
  const moveVec = useRef({x:0,y:0})
  const lookVec = useRef({x:0,y:0})
  const pinchVal = useRef(0)
  const speed = useRef(2.4)
  const [buffers] = useState(createBuffers)

  useEffect(()=>{ camera.position.set(0,1.6,4.5); yaw.current=0; pitch.current=0 },[camera])
  useEffect(()=>{
    const id = setInterval(()=>{ if (phase==='BONUS') tick() },1000)
    return ()=>clearInterval(id)
  },[phase, tick])

  useFrame((state, dt)=>{
    // camera look
    yaw.current   -= lookVec.current.x * dt * 1.8
    pitch.current -= lookVec.current.y * dt * 1.2
    pitch.current = Math.max(-1.1, Math.min(1.1, pitch.current))
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'))
    camera.quaternion.copy(q)

    // movement (local)
    const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion)
    const right   = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion)
    forward.y=0; right.y=0; forward.normalize(); right.normalize()
    const wish = new THREE.Vector3().addScaledVector(forward, -moveVec.current.y).addScaledVector(right, moveVec.current.x)
    velocity.current.lerp(wish.multiplyScalar(speed.current), 0.18)
    camera.position.add(velocity.current.clone().multiplyScalar(dt))

    // pinch adjusts speed slightly
    speed.current = 2.4 + THREE.MathUtils.clamp(pinchVal.current, -1, 1) * 1.2

    // distance to snitch for catch
    if (snitchRef.current){
      const d = camera.position.distanceTo(snitchRef.current.position)
      if (d < 0.6 && phase==='PLAY'){
        addScore(50)
        onCatch(snitchRef.current.position.clone(), buffers.chime)
        setPhase('CAGE')
        setTimeout(()=>{ enterBonus() }, 1800)
      }
    }
  })

  return (
    <Html>
      <TouchControls 
        onMoveVec={(v)=>{ moveVec.current=v }}
        onLookVec={(v)=>{ lookVec.current=v }}
        onPinch={(s)=>{ pinchVal.current = s }}
        onGrab={()=>{/* optional extra gesture for future */}}
      />
    </Html>
  )
}

function SnitchAgent({ obstaclesRef, onCatch }){
  const { camera, scene } = useThree()
  const ref = useRef()
  const aiRef = useRef()
  const obstacles = useMemo(()=>{
    const arr=[]; scene.traverse(o=>{ if(o.isMesh && o.geometry && o.material) arr.push(o) })
    return arr
  },[scene])

  useEffect(()=>{ aiRef.current = new SnitchAI(ref.current) },[])
  useFrame((_,dt)=>{
    aiRef.current && aiRef.current.step(scene, camera, obstacles, dt)
  })
  return (
    <group ref={ref} position={[0,1.2,0]}>
      <Snitch />
    </group>
  )
}

function BonusAgents({ active, onCatchQuaffle, onCatchBludger }){
  const { camera, scene } = useThree()
  const qRef = useRef(); const b1Ref = useRef(); const b2Ref = useRef()
  const qAI = useRef(); const b1AI = useRef(); const b2AI = useRef()
  const [spawned, setSpawned] = useState(false)

  useEffect(()=>{
    if (active && !spawned){
      setSpawned(true)
      if (qRef.current){ qRef.current.position.set(0,1.3,0); qAI.current = new SteeringBall(qRef.current,{maxSpeed:2.0,accel:5}) }
      if (b1Ref.current){ b1Ref.current.position.set(1.2,1.2,-1.2); b1AI.current = new SteeringBall(b1Ref.current,{maxSpeed:3.0,accel:7}) }
      if (b2Ref.current){ b2Ref.current.position.set(-1.2,1.4,1.2); b2AI.current = new SteeringBall(b2Ref.current,{maxSpeed:3.0,accel:7}) }
    }
    if (!active){ setSpawned(false) }
  },[active, spawned])

  useFrame((_,dt)=>{
    if (!active) return
    const player = camera.position.clone()
    const obstacles=[]; scene.traverse(o=>{ if(o.isMesh && o.geometry && o.material) obstacles.push(o) })

    const stepBall=(AI, ref, behavior)=>{
      if(!AI||!ref) return
      const pos = ref.position
      const force = new THREE.Vector3()
      if (behavior==='QUAFFLE'){
        // gentle drift with curiosity toward player but avoids getting too close
        const toPlayer = player.clone().sub(pos).setY(0)
        AI.target.copy(pos.clone().add(toPlayer.normalize().multiplyScalar(0.8)))
      } else {
        // bludgers: intermittently lunge toward player
        const toPlayer = player.clone().sub(pos)
        const lunge = Math.random()<0.02
        if (lunge) AI.target.copy(player.clone())
        else AI.target.add(new THREE.Vector3((Math.random()-0.5)*0.4,(Math.random()-0.5)*0.2,(Math.random()-0.5)*0.4))
      }
      AI.avoid(force, obstacles, player)
      AI.seek(force, AI.target.clone().sub(pos))
      AI.integrate(force, dt)
      ref.position.y = THREE.MathUtils.clamp(ref.position.y, 0.5, 2.6)

      const d = ref.position.distanceTo(player)
      if (d < (behavior==='QUAFFLE'?0.7:0.6)){
        if (behavior==='QUAFFLE') onCatchQuaffle(ref.position.clone())
        else onCatchBludger(ref.position.clone())
        // respawn nearby
        ref.position.set( (Math.random()-0.5)*4, 1+Math.random()*1, (Math.random()-0.5)*4 )
        AI.vel.set(0.1,0,0.1)
      }
    }

    stepBall(qAI.current, qRef.current, 'QUAFFLE')
    stepBall(b1AI.current, b1Ref.current, 'BLUDGER')
    stepBall(b2AI.current, b2Ref.current, 'BLUDGER')
  })

  if (!active) return null
  return (
    <group>
      <group ref={qRef}><Quaffle/></group>
      <group ref={b1Ref}><Bludger/></group>
      <group ref={b2Ref}><Bludger/></group>
    </group>
  )
}

function Cage({ at, onDone }){
  const ref = useRef()
  useEffect(()=>{
    if (ref.current){ ref.current.position.copy(at) }
    const t = setTimeout(()=> onDone && onDone(), 1600)
    return ()=>clearTimeout(t)
  },[at, onDone])
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#777" wireframe />
      </mesh>
    </group>
  )
}

function Scene(){
  const { camera } = useThree()
  const { phase, startGame, nextRound, addScore, enterBonus, timeLeft, setPhase, difficulty } = useGame()
  const snitchRef = useRef()
  const [fire, setFire] = useState(null)
  const [cageAt, setCageAt] = useState(null)

  // audio listener
  useEffect(()=>{ getListener(camera) },[camera])

  const handleCatch = (pos, chimeBuffer)=>{
    setFire({ pos: pos.toArray() })
    setCageAt(pos)
    // sound (global chime)
    const ctx = THREE.AudioContext.getContext()
    const src = ctx.createBufferSource(); src.buffer = chimeBuffer; src.connect(ctx.destination); src.start()
  }

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4,6,3]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Room />
      {phase==='PLAY' && <SnitchAgent obstaclesRef={null} onCatch={handleCatch} />}
      {phase==='PLAY' && <group ref={snitchRef} />}
      {phase==='CAGE' && cageAt && <Cage at={cageAt} onDone={()=>{ setPhase('BONUS') }} />}
      <BonusAgents active={phase==='BONUS'} 
        onCatchQuaffle={(p)=>{ addScore(10) }}
        onCatchBludger={(p)=>{ addScore(20) }}
      />
      {fire && <Fireworks origin={fire.pos} onDone={()=>setFire(null)} />}
      <Html><HUD info={'Chase the Snitch. Pinch to adjust speed. Catch radius ~0.6m. Bonus: Quaffle(10), Bludger(20).'} /></Html>
      <OrbitControls enablePan={false} enableZoom={false} enabled={false} />
      <PlayerRig onCatch={handleCatch} snitchRef={snitchRef} />
    </>
  )
}

function Menu(){
  const { initials, setInitials, startGame, score, hiScore, round, phase } = useGame()
  const [name, setName] = useState(initials)
  useEffect(()=>{ setName(initials) },[initials])
  return (
    <div className="center">
      <div className="card col" style={{minWidth:280}}>
        <h2 style={{margin:'6px 0'}}>Peqiuddich</h2>
        <div className="row"><label>Initials</label><input className="input" maxLength={3} value={name} onChange={e=>setName(e.target.value.toUpperCase())}/></div>
        <div className="row">
          <button className="button" onClick={()=>{ setInitials(name || '---'); startGame() }}>Start</button>
        </div>
        <div className="row gap6" style={{marginTop:8}}>
          <div className="badge">High Score: {hiScore}</div>
        </div>
      </div>
    </div>
  )
}

function RoundEnd(){
  const { nextRound, score, round } = useGame()
  return (
    <div className="center"><div className="card col" style={{minWidth:260}}>
      <h3>Round {round} Complete</h3>
      <div className="badge">Score: {score}</div>
      <button className="button" onClick={()=>nextRound()}>Next Round</button>
    </div></div>
  )
}

export default function App(){
  const { phase } = useGame()
  return (
    <div style={{height:'100vh',width:'100vw',background:'#0a0a0a'}}>
      <Canvas shadows dpr={[1,2]} camera={{ fov: 60 }}>
        <Scene />
      </Canvas>
      {phase==='MENU' && <Menu/>}
      {phase==='ROUND_END' && <RoundEnd/>}
    </div>
  )
}
