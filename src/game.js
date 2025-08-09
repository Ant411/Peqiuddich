
import { create } from 'zustand'

export const useGame = create((set, get) => ({
  initials: localStorage.getItem('peq_initials') || '',
  setInitials: (v) => { localStorage.setItem('peq_initials', v); set({ initials: v }) },
  phase: 'MENU', // MENU | PLAY | BONUS | CAGE | ROUND_END
  round: 1,
  score: 0,
  hiScore: Number(localStorage.getItem('peq_hi') || 0),
  timeLeft: 0,
  difficulty: 1,
  startGame: () => set({ phase: 'PLAY', score: 0, round: 1, difficulty: 1 }),
  nextRound: () => {
    const d = get().difficulty + 1
    const r = get().round + 1
    set({ phase: 'PLAY', round: r, difficulty: d, timeLeft: 0 })
  },
  enterBonus: () => set({ phase: 'BONUS', timeLeft: 15 }),
  tick: () => {
    const t = get().timeLeft - 1
    set({ timeLeft: t })
    if (t <= 0) set({ phase: 'ROUND_END', timeLeft: 0 })
  },
  addScore: (n) => {
    const s = get().score + n
    set({ score: s })
    const hi = get().hiScore
    if (s > hi) { localStorage.setItem('peq_hi', String(s)); set({ hiScore: s }) }
  },
  setPhase: (p) => set({ phase: p }),
}))
