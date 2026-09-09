class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.chunkSize = 16000 * 0.25; 
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer.push(channelData[i]);
      }

      if (this.buffer.length >= this.chunkSize) {
        const chunk = new Float32Array(this.buffer.slice(0, this.chunkSize));
        this.buffer = this.buffer.slice(this.chunkSize);
        this.port.postMessage(chunk);
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
