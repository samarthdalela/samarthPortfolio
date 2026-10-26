// Helpers for the Audio to Text tool: decode a recording to the 16 kHz mono samples Whisper expects,
// split it into ≤30 s pieces at quiet moments, and export the transcript as TXT, SRT, VTT or Word.
import { esc, writeDocx } from './docxWriter'

export const SAMPLE_RATE = 16000

// Any audio or video file the browser can play → Float32Array of 16 kHz mono samples.
export async function decodeAudio(file) {
  const Ctx = window.AudioContext || window.webkitAudioContext
  let ctx
  try {
    ctx = new Ctx({ sampleRate: SAMPLE_RATE })
  } catch {
    ctx = new Ctx()
  }
  try {
    let audio = await ctx.decodeAudioData(await file.arrayBuffer())
    if (audio.sampleRate !== SAMPLE_RATE) {
      // Older browsers ignore the requested rate; resample (and mix to mono) with an offline context.
      const off = new OfflineAudioContext(1, Math.ceil(audio.duration * SAMPLE_RATE), SAMPLE_RATE)
      const src = off.createBufferSource()
      src.buffer = audio
      src.connect(off.destination)
      src.start()
      audio = await off.startRendering()
    }
    if (audio.numberOfChannels === 1) return audio.getChannelData(0)
    const out = new Float32Array(audio.length)
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const ch = audio.getChannelData(c)
      for (let i = 0; i < out.length; i++) out[i] += ch[i] / audio.numberOfChannels
    }
    return out
  } finally {
    ctx.close?.()
  }
}

// Splits samples into [start, end) pieces of at most `maxSec`, cutting at the quietest moment between
// minSec and maxSec so words are not chopped in half. Quiet pieces are flagged (Whisper invents text on silence).
export function splitAtSilence(samples, { minSec = 18, maxSec = 28 } = {}) {
  const frame = SAMPLE_RATE / 10
  const frames = Math.ceil(samples.length / frame)
  const energy = new Float32Array(frames)
  for (let f = 0; f < frames; f++) {
    let sum = 0
    const end = Math.min(samples.length, (f + 1) * frame)
    for (let i = f * frame; i < end; i++) sum += samples[i] * samples[i]
    energy[f] = Math.sqrt(sum / (end - f * frame))
  }
  const pieces = []
  let start = 0
  while (start < frames) {
    let cut = frames
    if (frames - start > maxSec * 10) {
      cut = start + maxSec * 10
      for (let f = start + minSec * 10; f < start + maxSec * 10; f++) if (energy[f] < energy[cut]) cut = f
    }
    let peak = 0
    for (let f = start; f < cut; f++) peak = Math.max(peak, energy[f])
    pieces.push({ start: start * frame, end: Math.min(samples.length, cut * frame), quiet: peak < 0.01 })
    start = cut
  }
  return pieces
}

const pad = (n, w = 2) => String(n).padStart(w, '0')

// 83.4 → "00:01:23,400" (SRT) or "00:01:23.400" (VTT); short form "1:23" for display.
export function timecode(sec, sep = ',') {
  const ms = Math.round(sec * 1000)
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`
}

export function clock(sec) {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  return h ? `${h}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${Math.floor(s / 60)}:${pad(s % 60)}`
}

// segments: [{ start, end, text }] in seconds.
export const toText = (segments, withTimes) =>
  segments.map((s) => (withTimes ? `[${clock(s.start)}] ${s.text}` : s.text)).join(withTimes ? '\n' : ' ')

export const toSrt = (segments) =>
  segments.map((s, i) => `${i + 1}\n${timecode(s.start)} --> ${timecode(s.end)}\n${s.text}\n`).join('\n')

export const toVtt = (segments) =>
  `WEBVTT\n\n${segments.map((s) => `${timecode(s.start, '.')} --> ${timecode(s.end, '.')}\n${s.text}\n`).join('\n')}`

export function toDocx(segments, title, withTimes) {
  const para = (text, bold) =>
    `<w:p><w:r>${bold ? '<w:rPr><w:b/><w:sz w:val="32"/></w:rPr>' : ''}<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  const body = para(title, true) + (withTimes ? segments.map((s) => para(`[${clock(s.start)}] ${s.text}`)).join('') : para(toText(segments)))
  return writeDocx({ body, page: { w: 595, h: 842, top: 72, right: 72, bottom: 72, left: 72 }, defaults: { size: 12, after: 8 } })
}
