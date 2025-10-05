import { create } from 'zustand'

type Phrase = { id: string; text: string }

export type Mode = 'idle' | 'listening' | 'enhancing' | 'speaking' | 'asr'

type State = {
  // audio + ui
  noise: number
  volume: number
  rate: number
  pitch: number
  clarity: number
  inputLang: string
  outputLang: string
  asrText: string
  running: boolean
  mode: Mode

  // quick phrases
  phrases: Phrase[]

  // environment listening session
  envListening: boolean
  envStartTs: number | null
  envElapsedSec: number
  envMinCountdown: number // counts down from 5 to 0
  envAvgNoise: number
  suggestedVolume: number | null

  // setters/actions
  setNoise: (n: number) => void
  setVolume: (v: number) => void
  setRate: (v: number) => void
  setPitch: (v: number) => void
  setClarity: (v: number) => void
  setASR: (t: string) => void
  setLangs: (inLang: string, outLang: string) => void
  toggleRun: () => void
  setMode: (m: Mode) => void

  addPhrase: (text: string) => void
  removePhrase: (id: string) => void

  startEnvSession: () => void
  updateEnvProgress: (elapsedSec: number, minCountdown: number) => void
  stopEnvSession: (avg: number) => void
  resetEnv: () => void

  setSuggestedVolume: (v: number | null) => void
  setEnvAvgNoise: (v: number) => void
}

export const useApp = create<State>((set, get) => ({
  noise: 20,
  volume: 0.6,
  rate: 1,
  pitch: 1,
  clarity: 0.5,
  inputLang: 'en-US',
  outputLang: 'en-US',
  asrText: '',
  running: false,
  mode: 'idle',

  phrases: [
    { id: crypto.randomUUID(), text: 'Hello!' },
    { id: crypto.randomUUID(), text: 'One moment please.' },
  ],

  envListening: false,
  envStartTs: null,
  envElapsedSec: 0,
  envMinCountdown: 5,
  envAvgNoise: 0,
  suggestedVolume: null,

  setNoise: (n) => set({ noise: n }),
  setVolume: (v) => set({ volume: v }),
  setRate: (v) => set({ rate: v }),
  setPitch: (v) => set({ pitch: v }),
  setClarity: (v) => set({ clarity: v }),
  setASR: (t) => set({ asrText: t }),
  setLangs: (inLang, outLang) => set({ inputLang: inLang, outputLang: outLang }),
  toggleRun: () => set({ running: !get().running }),
  setMode: (m) => set({ mode: m }),

  addPhrase: (text) => {
    const id = crypto.randomUUID()
    set({ phrases: [...get().phrases, { id, text }] })
  },
  removePhrase: (id) => set({ phrases: get().phrases.filter(p => p.id !== id) }),

  startEnvSession: () => set({
    envListening: true,
    envStartTs: performance.now(),
    envElapsedSec: 0,
    envMinCountdown: 5,
    envAvgNoise: 0,
    suggestedVolume: null,
    mode: 'listening',
  }),
  updateEnvProgress: (elapsedSec, minCountdown) => set({
    envElapsedSec: elapsedSec,
    envMinCountdown: minCountdown
  }),
  stopEnvSession: (avg) => set({
    envListening: false,
    envStartTs: null,
    envElapsedSec: 0,
    envMinCountdown: 5,
    envAvgNoise: avg,
    mode: 'idle'
  }),
  resetEnv: () => set({
    envListening: false,
    envStartTs: null,
    envElapsedSec: 0,
    envMinCountdown: 5
  }),

  setSuggestedVolume: (v) => set({ suggestedVolume: v }),
  setEnvAvgNoise: (v) => set({ envAvgNoise: v }),
}))
