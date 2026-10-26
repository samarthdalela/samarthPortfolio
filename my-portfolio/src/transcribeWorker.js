// Speech recognition for the Audio to Text tool, off the main thread. Runs OpenAI's Whisper model in the
// browser with transformers.js, so the recording never leaves the device. The library is loaded from a CDN on
// first use (only this tool needs it); the model is downloaded once from Hugging Face and cached by the browser.
import { SAMPLE_RATE, splitAtSilence } from './transcribe'

const LIB = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js'

let lib, asr, asrModel

async function load(model) {
  if (asr && asrModel === model) return asr
  lib ??= await import(/* @vite-ignore */ LIB)
  lib.env.allowLocalModels = false
  await asr?.dispose()
  asr = null
  const files = {}
  asr = await lib.pipeline('automatic-speech-recognition', `onnx-community/${model}`, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (p) => {
      if (p.status !== 'progress' || !p.total) return
      files[p.file] = { loaded: p.loaded, total: p.total }
      const all = Object.values(files)
      self.postMessage({ type: 'download', loaded: all.reduce((n, f) => n + f.loaded, 0), total: all.reduce((n, f) => n + f.total, 0) })
    },
  })
  asrModel = model
  return asr
}

self.onmessage = async ({ data }) => {
  const { audio, model, language, task } = data
  try {
    const run = await load(model)
    const pieces = splitAtSilence(audio)
    self.postMessage({ type: 'start', total: pieces.length })
    for (const [i, p] of pieces.entries()) {
      const offset = p.start / SAMPLE_RATE
      const end = p.end / SAMPLE_RATE
      let segments = []
      if (!p.quiet) {
        const out = await run(audio.subarray(p.start, p.end), {
          return_timestamps: true,
          task,
          ...(language ? { language } : {}),
        })
        segments = (out.chunks?.length ? out.chunks : [{ timestamp: [0, null], text: out.text }])
          .map((c) => ({
            start: offset + (c.timestamp[0] ?? 0),
            end: Math.min(end, offset + (c.timestamp[1] ?? end - offset)),
            text: c.text.trim(),
          }))
          .filter((s) => s.text)
      }
      self.postMessage({ type: 'piece', index: i, segments })
    }
    self.postMessage({ type: 'done' })
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err?.message || err) })
  }
}
