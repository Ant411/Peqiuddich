
import * as THREE from 'three'
import { SteeringBall, computeHidingSpot, raycastToObstacles } from './BallAI'

export class SnitchAI extends SteeringBall {
  constructor(object3D, params={}){
    super(object3D, { maxSpeed: 3.4, accel: 7.5, ...params })
  }
  step(scene, camera, obstacles, dt, setTargetFn){
    const now = performance.now()/1000
    const pos = this.obj.position
    const player = camera.position.clone()
    const playerDist = pos.distanceTo(player)
    if (playerDist < 2.2 && this.state!=='HIDE') this.state = 'EVADE'
    if (playerDist < 1.0) this.state = 'HIDE'
    if (playerDist > 3.4 && now - this.lastSwitch > 2) this.state = 'WANDER'

    if (this.state==='HIDE'){
      let best=null, bestDist=Infinity
      for (const o of obstacles){
        const spot = computeHidingSpot(player, o, 0.6)
        const d = spot.distanceTo(pos)
        if (d<bestDist){bestDist=d; best=spot}
      }
      if (best) this.target.copy(best)
    } else if (this.state==='EVADE'){
      const away = pos.clone().sub(player).applyAxisAngle(new THREE.Vector3(0,1,0), 0.35)
      this.target.copy(pos.clone().add(away.setLength(this.maxSpeed)))
    } else if (this.state==='WANDER'){
      const jitter = new THREE.Vector3( (Math.random()-0.5)*0.6, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.6 )
      this.target.add(jitter)
      this.target.y = THREE.MathUtils.clamp(this.target.y, 0.6, 2.2)
    }

    const force = new THREE.Vector3()
    this.avoid(force, obstacles, player)
    this.seek(force, this.target.clone().sub(pos))
    this.integrate(force, dt)

    // bounds
    this.obj.position.x = THREE.MathUtils.clamp(this.obj.position.x, -6.5, 6.5)
    this.obj.position.z = THREE.MathUtils.clamp(this.obj.position.z, -5.5, 5.5)
    this.obj.position.y = THREE.MathUtils.clamp(this.obj.position.y, 0.5, 2.6)
  }
}
