import { create } from 'zustand'

type Phrase = { id: string; text: string }

type State = {
  // audio + UI state
  noise: number
  volume: number
  rate: number
  pitch: number
  inputLang: string
  outputLang: string
  asrText: string
  running: boolean

  // calibration results
  envAvgNoise: number
  suggestedVolume: number | null

  // quick phrases
  phrases: Phrase[]

  // mode indicator
  mode: 'idle' | 'listening' | 'enhancing' | 'speaking'

  // setters
  setNoise: (n: number) => void
  setVolume: (v: number) => void
  setRate: (v: number) => void
  setPitch: (v: number) => void
  setASR: (t: string) => void
  setLangs: (inLang: string, outLang: string) => void
  toggleRun: () => void
  setEnvAvgNoise: (v: number) => void
  setSuggestedVolume: (v: number | null) => void
  setMode: (m: State['mode']) => void

  addPhrase: (text: string) => void
  removePhrase: (id: string) => void
}

export const useApp = create<State>((set, get) => ({
  noise: 20,
  volume: 1,
  rate: 1,
  pitch: 1,
  inputLang: 'en-US',
  outputLang: 'en-US',
  asrText: '',
  running: false,

  envAvgNoise: 0,
  suggestedVolume: null,

  phrases: [],
  mode: 'idle',

  setNoise: (n) => set({ noise: n }),
  setVolume: (v) => set({ volume: v }),
  setRate: (v) => set({ rate: v }),
  setPitch: (v) => set({ pitch: v }),
  setASR: (t) => set({ asrText: t }),
  setLangs: (inLang, outLang) => set({ inputLang: inLang, outputLang: outLang }),
  toggleRun: () => set({ running: !get().running }),
  setEnvAvgNoise: (v) => set({ envAvgNoise: v }),
  setSuggestedVolume: (v) => set({ suggestedVolume: v }),
  setMode: (m) => set({ mode: m }),

  addPhrase: (text) => {
    const id = crypto.randomUUID()
    const newPhrase = { id, text }
    set({ phrases: [...get().phrases, newPhrase] })
  },
  removePhrase: (id) => {
    set({ phrases: get().phrases.filter((p) => p.id !== id) })
  },
}))
