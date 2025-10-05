// ✅ TypeScript shim for Web Speech API globals
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
export {};

import { useApp } from "../store";
import { initRnnoise } from "./rnnoise";
import { recordEnhanced, playEnhanced, getAudioContext } from "./enhance";

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let recognition: any | null = null;
let meterActive = false;
let currentNoise = 20;

/** Initialize audio capture + RNNoise (for metering & ASR). */
export async function initAudio() {
  if (ctx) return;
  ctx = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const src = ctx.createMediaStreamSource(stream);

  await initRnnoise(ctx);

  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  src.connect(analyser);
  await ctx.resume();
  startMeter();
  console.log("🎤 Audio initialized");
}

/** Real-time noise meter loop → store.noise */
function startMeter() {
  if (meterActive) return;
  meterActive = true;

  const { setNoise } = useApp.getState();
  const data = new Uint8Array(1024);

  const loop = () => {
    if (!analyser) return;
    analyser.getByteTimeDomainData(data);

    let sum = 0;
    for (const x of data) {
      const v = (x - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const dBA = Math.max(20, Math.min(100, 20 * Math.log10(rms + 1e-4) + 90));
    currentNoise += (dBA - currentNoise) * 0.15;

    setNoise(currentNoise);
    requestAnimationFrame(loop);
  };

  loop();
}

/** Helper: map ambient dBA → suggested TTS volume (0..1). */
export function volumeFromNoise(noiseDBA: number) {
  if (noiseDBA <= 25) return 0.45;
  if (noiseDBA <= 45) return 0.45 + (noiseDBA - 25) * (0.20 / 20);
  if (noiseDBA <= 65) return 0.65 + (noiseDBA - 45) * (0.20 / 20);
  return Math.min(1.0, 0.85 + (noiseDBA - 65) * (0.15 / 20));
}

/** Ambient measurement for N seconds; returns average dBA. */
export async function startEnvListening(durationSec = 5): Promise<number> {
  if (!ctx || !analyser) await initAudio();
  if (!ctx || !analyser) throw new Error('Audio not initialized.');

  console.log(`🎧 Listening to environment for ${durationSec}s...`);
  const values: number[] = [];
  const data = new Uint8Array(1024);
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = () => {
      if (!analyser) return resolve(0);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const x of data) {
        const v = (x - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const dBA = Math.max(20, Math.min(100, 20 * Math.log10(rms + 1e-4) + 90));
      values.push(dBA);

      if (performance.now() - start < durationSec * 1000) {
        requestAnimationFrame(tick);
      } else {
        const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
        console.log(`✅ Environment noise average: ${avg.toFixed(1)} dBA`);
        resolve(avg);
      }
    };
    tick();
  });
}

/** No-op for compatibility with older UI; measurement auto-stops. */
export function stopEnvListening() {
  console.log('🛑 Environment listening stop requested (no-op)');
}

/** Record, enhance, and immediately play back the user’s speech. */
export async function recordAndPlayEnhanced(seconds = 5) {
  // Reuse enhancer's context if initialized
  const existing = getAudioContext();
  if (!ctx && existing) ctx = existing;
  if (!ctx) await initAudio();

  console.log('🎙️ Recording and enhancing speech...');
  const blob = await recordEnhanced(seconds);
  console.log('🎧 Playing enhanced output...');
  playEnhanced(blob);
}

/** TTS out */
export function speak(text: string) {
  const s = useApp.getState();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = s.outputLang;
  u.rate = s.rate;
  u.pitch = s.pitch;
  u.volume = s.volume;
  window.speechSynthesis.speak(u);
}

/** Start Web Speech API recognition */
export function startRecording() {
  const { inputLang, setASR, toggleRun } = useApp.getState();
  const Rec = window.webkitSpeechRecognition || window.SpeechRecognition;
  if (!Rec) {
    alert("SpeechRecognition not supported");
    return;
  }

  recognition = new Rec();
  recognition.lang = inputLang;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (e: any) => {
    let txt = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      txt += e.results[i][0].transcript + " ";
    }
    setASR(txt.trim());
  };

  recognition.onend = () => {
    const { running } = useApp.getState();
    if (running) stopRecording();
  };

  recognition.start();
  toggleRun();
  console.log("🎙️ Recognition started");
}

/** Stop recognition */
export function stopRecording() {
  const { running, toggleRun } = useApp.getState();
  if (recognition) {
    recognition.onend = null;
    recognition.stop();
    recognition = null;
  }
  if (running) toggleRun();
  console.log("🛑 Recognition stopped");
}
