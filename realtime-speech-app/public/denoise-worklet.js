class RNNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(480);
    this.bufferPos = 0;
    this.ready = false;
    this.port.onmessage = (e) => {
      if (e.data === "init") this.ready = true;
    };
  }

  process(inputs, outputs) {
    const input = inputs[0][0];
    const output = outputs[0][0];
    if (!input || !this.ready) {
      if (output) output.fill(0);
      return true;
    }

    // Accumulate into 480-sample frames (RNNoise frame size @48k)
    let inPos = 0;
    let outPos = 0;
    while (inPos < input.length) {
      const need = 480 - this.bufferPos;
      const copy = Math.min(need, input.length - inPos);
      this.buffer.set(input.subarray(inPos, inPos + copy), this.bufferPos);
      this.bufferPos += copy;
      inPos += copy;

      if (this.bufferPos === 480) {
        // TODO: replace with real rnnoise.process(this.buffer) → output block
        for (let i = 0; i < 480 && outPos + i < output.length; i++) {
          const v = this.buffer[i];
          output[outPos + i] = Math.abs(v) < 0.004 ? 0 : v; // soft gate fallback
        }
        outPos += 480;
        this.bufferPos = 0;
      }
    }

    // Fill remainder (if any) with zeros
    if (output && outPos < output.length) {
      output.fill(0, outPos);
    }

    return true;
  }
}

registerProcessor("rnnoise-processor", RNNoiseProcessor);
