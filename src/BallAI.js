
import * as THREE from 'three'

const _ray = new THREE.Raycaster()

export function raycastToObstacles(origin, dir, obstacles, maxDist = 2.2) {
  _ray.set(origin, dir.clone().normalize())
  _ray.far = maxDist
  const hits = _ray.intersectObjects(obstacles, false)
  return hits.length ? hits[0] : null
}

export function computeHidingSpot(playerPos, obstacle, hideDist = 0.6) {
  const center = obstacle.position.clone()
  const toObs = center.clone().sub(playerPos).normalize()
  // approximate radius from bounding box
  const box = new THREE.Box3().setFromObject(obstacle)
  const radius = box.getSize(new THREE.Vector3()).length() / 4
  return center.clone().add(toObs.multiplyScalar(hideDist + radius))
}

export class SteeringBall {
  constructor(object3D, { maxSpeed=2.8, accel=6.5 } = {}){
    this.obj = object3D
    this.vel = new THREE.Vector3(0.1,0,0.1)
    this.maxSpeed = maxSpeed
    this.accel = accel
    this.target = new THREE.Vector3(0,1.2,2)
    this.state = 'WANDER'
    this.lastSwitch = 0
  }
  avoid(force, obstacles, playerPos){
    const pos = this.obj.position
    if (this.vel.lengthSq()<1e-6) return force
    const dirs = [ this.vel.clone(), this.vel.clone().applyAxisAngle(new THREE.Vector3(0,1,0),0.5), this.vel.clone().applyAxisAngle(new THREE.Vector3(0,1,0),-0.5) ]
    for (const d of dirs){
      const hit = raycastToObstacles(pos, d, obstacles, 1.0)
      if (hit){
        const away = pos.clone().sub(hit.point).setY(0).normalize().multiplyScalar(2.0)
        force.add(away)
      }
    }
    const toPlayer = pos.clone().sub(playerPos)
    const dist = toPlayer.length()
    if (dist < 0.8) force.add(toPlayer.normalize().multiplyScalar(2.0))
  }
  seek(force, desired){
    desired.clampLength(0, this.maxSpeed)
    force.add(desired.sub(this.vel))
  }
  integrate(force, dt){
    this.vel.add(force.multiplyScalar(dt * this.accel))
    this.vel.clampLength(0, this.maxSpeed)
    this.obj.position.add(this.vel.clone().multiplyScalar(dt))
    if (this.vel.lengthSq()>1e-4){
      const heading = Math.atan2(this.vel.x, this.vel.z)
      this.obj.rotation.y = heading
    }
  }
}
