// Turns whatever the browser recorded (webm on Android/Chrome, mp4 on Safari) into a short,
// trimmed, evenly loud mono WAV file, which every device can play.

export async function toCleanWav(recording: Blob): Promise<Blob> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(await recording.arrayBuffer())
    const samples = mixToMono(decoded)

    let peak = 0
    for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]))
    if (peak < 0.005) throw new Error('silent')

    // Cut the silence before and after the sound, leaving a tiny cushion so nothing is clipped.
    const threshold = Math.max(0.01, peak * 0.07)
    let start = 0
    while (start < samples.length && Math.abs(samples[start]) < threshold) start++
    let end = samples.length - 1
    while (end > start && Math.abs(samples[end]) < threshold) end--
    const rate = decoded.sampleRate
    start = Math.max(0, start - Math.round(rate * 0.04))
    end = Math.min(samples.length, end + Math.round(rate * 0.12))

    // Bring quiet recordings up (but never turn a whisper into a shout).
    const gain = Math.min(8, 0.9 / peak)
    return encodeWav(samples.subarray(start, end), rate, gain)
  } finally {
    void ctx.close()
  }
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const out = new Float32Array(buffer.length)
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < out.length; i++) out[i] += data[i] / buffer.numberOfChannels
  }
  return out
}

function encodeWav(samples: Float32Array, rate: number, gain: number): Blob {
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2))
  const text = (at: number, s: string) => [...s].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i] * gain))
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true)
  }
  return new Blob([view], { type: 'audio/wav' })
}
