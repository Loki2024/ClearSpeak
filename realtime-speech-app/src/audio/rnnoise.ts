/**
 * rnnoise.ts
 * Loads RNNoise as an AudioWorklet processor for real-time denoising.
 */

let rnnoiseReady = false;

/** Initialize RNNoise AudioWorklet. */
export async function initRnnoise(context: AudioContext): Promise<boolean> {
  if (rnnoiseReady) return true;
  try {
    await context.audioWorklet.addModule("/denoise-worklet.js");
    rnnoiseReady = true;
    console.log("✅ RNNoise worklet module loaded.");
    return true;
  } catch (err) {
    console.warn("⚠️ Failed to load RNNoise worklet, using fallback:", err);
    rnnoiseReady = false;
    return false;
  }
}

/** Create the RNNoise AudioWorklet node. */
export async function rnnoiseNode(context: AudioContext): Promise<AudioWorkletNode> {
  if (!rnnoiseReady) {
    const ok = await initRnnoise(context);
    if (!ok) throw new Error("RNNoise worklet unavailable");
  }

  const node = new AudioWorkletNode(context, "rnnoise-processor", {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 1,
  });

  node.port.postMessage("init");
  console.log("🎧 RNNoise AudioWorkletNode created.");
  return node;
}
