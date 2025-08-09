
import * as THREE from 'three'

let listener
export function getListener(camera) {
  if (!listener) {
    listener = new THREE.AudioListener()
    camera.add(listener)
  }
  return listener
}

// Generate simple AudioBuffers for effects
function makeBuffer(ctx, seconds, fn) {
  const rate = ctx.sampleRate
  const len = Math.floor(seconds * rate)
  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = fn(i / rate)
  return buffer
}

function flutterWave(t){ // wing flutter buzz
  const base = 500 + Math.sin(t*20)*40
  return Math.sin(2*Math.PI*base*t) * 0.3
}
function whooshWave(t){ // fast pass-by
  const base = 220 + 80*Math.sin(t*3)
  return Math.sin(2*Math.PI*base*t) * (1 - Math.min(t/0.4,1)) * 0.8
}
function chimeWave(t){ // catch reward
  const f = [880, 1320, 1760]
  return (Math.sin(2*Math.PI*f[0]*t) + Math.sin(2*Math.PI*f[1]*t)*0.6 + Math.sin(2*Math.PI*f[2]*t)*0.4) * Math.exp(-3*t) * 0.6
}

export function createBuffers() {
  const ctx = THREE.AudioContext.getContext()
  return {
    flutter: makeBuffer(ctx, 0.4, flutterWave),
    whoosh: makeBuffer(ctx, 0.5, whooshWave),
    chime: makeBuffer(ctx, 1.2, chimeWave)
  }
}

export function attachPositional(ref, buffer, loop=false, volume=0.6) {
  if (!ref.current) return
  const audio = new THREE.PositionalAudio(getListener(ref.current.parent ? ref.current.parent : ref.current))
  audio.setBuffer(buffer)
  audio.setRefDistance(1.2)
  audio.setRolloffFactor(1.5)
  audio.setLoop(loop)
  audio.setVolume(volume)
  ref.current.add(audio)
  if (loop) audio.play()
  return audio
}
