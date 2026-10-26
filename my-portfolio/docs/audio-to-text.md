# Audio to Text Converter — how it works

Live: https://samarthdalela.xyz/audio-to-text/

## The one-line pitch

> A free speech-to-text tool that runs **OpenAI's Whisper AI model entirely inside the browser**. Users drop in
> an audio/video file (or record from the mic) and get an editable transcript with timestamps, in 25+ languages
> including Hindi, exported as TXT, Word, SRT or VTT. **The recording is never uploaded to any server.**

Why that matters: most transcription apps (Otter, Rev, etc.) upload your audio to their servers and charge
per minute. Here the AI runs on the user's own device, so it is **private, free to run (no server/GPU cost)
and has no usage limits**.

---

## Tech stack

| Layer | What I used | Why |
|---|---|---|
| UI | **React 19** + **Vite** | Same stack as the rest of the portfolio |
| AI model | **Whisper** (OpenAI, open-source) — `onnx-community/whisper-tiny / base / small` | Best open-source speech recognition; multilingual; can also translate to English |
| Running the model in the browser | **transformers.js 3.8.1** (Hugging Face) | Runs Hugging Face models in JavaScript |
| Inference engine | **ONNX Runtime Web** (WebAssembly backend) | Executes the neural network on the CPU inside the browser |
| Model format | **ONNX, 8-bit quantized (`q8`)** | ~4× smaller download than full precision, with little accuracy loss |
| Background processing | **Web Worker** | Heavy AI work runs off the main thread, so the page never freezes |
| Audio decoding | **Web Audio API** (`AudioContext`, `OfflineAudioContext`) | Decodes MP3/WAV/M4A/OGG/MP4… and resamples to 16 kHz mono |
| Recording | **MediaRecorder** + `getUserMedia` | Record from the microphone directly on the page |
| Word export | My own small **DOCX writer** (WordprocessingML + **JSZip**) | Shared with the PDF to Word tool; no heavy library |
| SEO | Pre-rendering (React SSR at build time), JSON-LD structured data, landing pages | Google sees full content without running JS |

---

## Architecture

```
┌──────────────────────────── Browser (user's device) ─────────────────────────────┐
│                                                                                  │
│  Main thread (React UI)                         Web Worker                       │
│  src/components/AudioToText.jsx                 src/transcribeWorker.js          │
│                                                                                  │
│  1. File drop / mic recording                                                    │
│  2. decodeAudio()  ──► Float32Array (16 kHz mono)                                │
│  3. postMessage(audio, model, language, task) ───────►  4. load transformers.js  │
│                                                            + Whisper model       │
│                                                         5. splitAtSilence()      │
│  7. show progress + lines live  ◄──── 'download' / 'piece' messages ── 6. run    │
│  8. edit, copy, download TXT/DOCX/SRT/VTT                  Whisper per piece      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
        ▲ first use only: library from jsDelivr CDN, model files from Hugging Face
          (then cached by the browser). The AUDIO itself never leaves the device.
```

### Files

| File | What it does |
|---|---|
| [src/components/AudioToText.jsx](../src/components/AudioToText.jsx) | The UI: dropzone, recorder, dropdowns, progress bar, editable transcript, downloads |
| [src/transcribeWorker.js](../src/transcribeWorker.js) | Web Worker: loads the model, transcribes piece by piece, reports progress |
| [src/transcribe.js](../src/transcribe.js) | Helpers: decode audio, split at silence, timecodes, TXT/SRT/VTT/DOCX export |
| [src/data/audioToText.js](../src/data/audioToText.js) | Model list, language list, page text (steps, features, FAQs) |
| [src/pages/AudioToTextPage.jsx](../src/pages/AudioToTextPage.jsx) | The page, using the shared `ToolPage` layout |
| [src/data/landings.js](../src/data/landings.js) | SEO landing pages (MP3 to text, Hindi, subtitle generator, …) |

---

## Step by step: what happens when you press "Transcribe"

### 1. Getting the audio

- **File:** any format the browser can play (MP3, WAV, M4A, OGG/OPUS, FLAC, WebM, MP4, MOV…).
- **Microphone:** `navigator.mediaDevices.getUserMedia({ audio: true })` gives a stream; `MediaRecorder`
  records it into chunks; on stop the chunks become a `File` (WebM in Chrome, MP4/M4A in Safari) and go
  through exactly the same path as an uploaded file.
- An `<audio>`/`<video>` player is shown using `URL.createObjectURL(file)` — a local URL, no upload.

### 2. Decoding to what Whisper expects

Whisper needs **raw samples at 16,000 Hz, mono**. `decodeAudio()` in `transcribe.js`:

1. Creates an `AudioContext({ sampleRate: 16000 })` and calls `decodeAudioData()` — the browser's own
   decoder handles MP3/AAC/Opus/etc. and resamples to 16 kHz.
2. Fallback for older browsers that ignore the requested rate: render through an
   `OfflineAudioContext(1 channel, 16000 Hz)`, which resamples **and** mixes down to mono.
3. If there are still several channels, average them into one `Float32Array`.

### 3. Sending it to the worker (zero-copy)

```js
worker.postMessage({ audio, model, language, task }, [audio.buffer])
```

The second argument **transfers** the buffer instead of copying it — important for long recordings
(1 hour of 16 kHz audio is ~230 MB as Float32).

### 4. Loading the model (worker)

```js
lib ??= await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js')
asr = await lib.pipeline('automatic-speech-recognition', `onnx-community/${model}`, {
  dtype: 'q8', device: 'wasm', progress_callback,
})
```

- The library is **lazy-loaded from a CDN only when the user clicks Transcribe** — so it adds nothing to the
  page's initial load (good for Core Web Vitals and SEO).
- `progress_callback` reports bytes downloaded per file; the worker sums them and posts
  `{ type: 'download', loaded, total }` so the UI shows "Downloading the speech model: 30 MB of 75 MB".
- Model files are stored in the browser's **Cache Storage**, so the next visit starts much faster.
- The loaded pipeline is kept in memory; it is only reloaded if the user picks a different model.

Model options (8-bit sizes, encoder + decoder):

| Option | Model | Download | Use |
|---|---|---|---|
| Fast | whisper-tiny | ≈40 MB | Quick, less accurate |
| Balanced (default) | whisper-base | ≈75 MB | Good for English |
| Most accurate | whisper-small | ≈240 MB | Best for Hindi, Indian languages and accents |

### 5. Splitting the audio — smart chunking at silence

Whisper only looks at **30 seconds at a time**. Cutting blindly every 30 s chops words in half and the
model gets them wrong. So `splitAtSilence()`:

1. Divides the audio into **0.1 s frames** and computes each frame's loudness (**RMS energy**).
2. For each piece, looks between **18 s and 28 s** and cuts at the **quietest frame** — usually a pause
   between words or sentences.
3. Marks a piece as **quiet** if its loudest frame is below a threshold (RMS < 0.01).

Quiet pieces are **skipped**, because Whisper is known to "hallucinate" text (like "Thank you for
watching") on silence. Skipping them fixes that and saves time.

### 6. Transcribing piece by piece

```js
const out = await asr(audio.subarray(p.start, p.end), { return_timestamps: true, task, language })
```

- `subarray` is a view, not a copy.
- `task`: `'transcribe'` (same language) or `'translate'` (any language → English text; this is a built-in
  Whisper feature).
- `language`: e.g. `'hi'` for Hindi, or left out for auto-detect.
- `return_timestamps: true` gives segments like `{ timestamp: [2.4, 6.1], text: '...' }`. I add the
  piece's start offset so the times are correct for the whole file.
- After every piece the worker posts `{ type: 'piece', index, segments }`, so **text appears live** and the
  progress bar moves.

### 7. Cancel and safety

- **Cancel** = `worker.terminate()` — instantly stops the AI work (you can't interrupt a running WASM call
  any other way).
- A **run id** (`useRef` counter) is bumped on every start/cancel; late results from an old run are ignored.
  This stops a race condition where the user cancels while the file is still being decoded.
- Errors are shown in plain language (e.g. "your device may be low on memory — try Fast or a shorter
  recording").

### 8. Editing and exporting

Each line is an editable textarea; edits update the same `segments` state, so **every export includes the
user's corrections**. Clicking a timestamp seeks the player to that moment (`player.currentTime = start`).

| Format | How |
|---|---|
| Copy | `navigator.clipboard.writeText()` |
| TXT | Plain text, optionally `[1:23] line` with timestamps |
| SRT | `1` ⏎ `00:00:02,400 --> 00:00:06,100` ⏎ `text` — for YouTube, Premiere Pro, CapCut, VLC |
| VTT | `WEBVTT` header, times use `.` instead of `,` — the web standard (`<track>`) |
| Word | DOCX built by my `writeDocx()`: XML parts zipped with JSZip, A4 page, title in bold |

Downloads use a `Blob` + temporary object URL, revoked after 1 s to free memory.

---

## How Whisper works (short version for the interview)

- **Encoder–decoder Transformer** (same family as GPT/BERT), trained by OpenAI on **680,000 hours** of
  multilingual audio.
- Audio → **log-Mel spectrogram** (a picture of frequencies over time, 30 s window) → **encoder** turns it into
  features → **decoder** generates text tokens one by one, like a language model.
- Special tokens tell it the **language**, the **task** (transcribe/translate) and to emit **timestamps**.
- It adds **punctuation and capitals** automatically because it learned from real transcripts.
- **ONNX** is a standard file format for neural networks; **ONNX Runtime Web** runs it via **WebAssembly**
  at near-native speed. **Quantization (q8)** stores weights as 8-bit integers instead of 32-bit floats →
  ~4× smaller and faster, with a small accuracy cost.

---

## Key design decisions (and why)

1. **On-device instead of a server API** — privacy (interviews, meetings, voice notes stay private), zero
   running cost for me, no rate limits, works the same for 1 or 10,000 users.
2. **Web Worker** — inference takes seconds to minutes; on the main thread the page would freeze.
3. **CDN import instead of `npm install`** — the npm package pulls in `onnxruntime-node` and `sharp`
   (hundreds of MB, Node-only). The install even failed on a network reset. The browser build from jsDelivr
   is all the browser needs, keeps `node_modules` and Vercel builds light, and is **pinned to an exact
   version** (3.8.1) so it can't change underneath me.
4. **Lazy loading** — nothing heavy loads until the user clicks Transcribe, so the page stays fast for SEO.
5. **Silence-based chunking + skipping silent pieces** — better accuracy at chunk borders, no hallucinated
   text, and it gives real progress reporting.
6. **Three model sizes** — the user chooses speed vs accuracy; landing pages preset the right one
   (Hindi page → "Most accurate").
7. **WASM backend, 8-bit model** — works on every modern browser and phone; predictable download size.

---

## SEO work for the tool

- **Pre-rendered HTML**: at build time React renders each page to HTML (`scripts/prerender.mjs`), so
  Google sees all text without running JavaScript.
- **Structured data (JSON-LD)**: `WebApplication` (free, `isAccessibleForFree`), `HowTo` (the 4 steps),
  `FAQPage` (eligible for FAQ rich results), `BreadcrumbList`.
- **Landing pages** for different search intents, generated from one data file (`landings.js`):
  `/mp3-to-text/`, `/video-to-text/`, `/voice-to-text/`, `/speech-to-text/`, `/subtitle-generator/`,
  `/hindi-audio-to-text/` and Marathi, Bengali, Tamil, Telugu, Gujarati, Urdu pages (with native-script
  titles like "தமிழ்"). Each reuses the same component with presets (language, model).
- **Titles ≤ ~60 chars, descriptions ≤ ~155 chars** so Google shows them in full; canonical URLs; Open Graph
  and Twitter cards.
- **Internal linking**: the tools hub, home page, footer and "More free tools" (related tools listed first)
  all link to it; every page is in `sitemap.xml` automatically.

---

## Limitations (be honest about these in an interview)

- **Speed depends on the user's device** — it runs single-threaded WASM on the CPU; long files take a
  while on phones.
- **First run downloads the model** (40–240 MB).
- **Memory**: very long recordings (> ~1 hour) are decoded fully into memory.
- **Accuracy** is lower for some Indian languages (Tamil, Telugu, etc.) than for English/Hindi, and with
  loud background music.
- **Not real-time** — you record first, then transcribe.
- **No speaker labels** (who said what).

## What I would improve next

- **WebGPU** backend (`device: 'webgpu'`) — can be several times faster on supported browsers.
- **Multi-threaded WASM** by enabling cross-origin isolation (COOP/COEP headers) so ONNX Runtime can use
  `SharedArrayBuffer` threads.
- **Streaming decode** for very long files instead of loading everything into memory.
- **Word-level timestamps** for karaoke-style captions; **speaker diarization**.
- **Live transcription** while recording (process the mic stream in chunks).

---

## Likely interview questions — with answers

**Q: Why not just call the OpenAI Whisper API?**
Cost and privacy. The API charges per minute and needs my server and API key; users would upload private
audio. Running the open-source model in the browser costs me nothing per user and the audio never leaves
their device.

**Q: How do you run a neural network in a browser?**
The model is exported to ONNX format and executed by ONNX Runtime Web, compiled to WebAssembly.
transformers.js wraps it with the same `pipeline()` API as Python's Hugging Face library and handles the
audio preprocessing (log-Mel spectrogram) and token decoding.

**Q: Why a Web Worker?**
JavaScript is single-threaded. Running the model on the main thread would freeze scrolling and clicks for
minutes. The worker runs in parallel and talks to the UI with `postMessage`.

**Q: How do you handle files longer than 30 seconds?**
Whisper's window is 30 s. I compute RMS energy every 0.1 s and cut each piece at the quietest point between
18 and 28 seconds, so words aren't cut in half. Silent pieces are skipped to avoid hallucinated text. Each
piece's timestamps are shifted by its start offset.

**Q: How do you show progress?**
Two kinds: model download (summing `loaded/total` bytes from the `progress_callback`) and transcription
(pieces done / total pieces). The worker posts messages after every piece, so text also appears live.

**Q: How does cancel work?**
`worker.terminate()` kills it immediately. A run-id counter makes sure any late result from a cancelled run
is ignored — avoiding a race condition.

**Q: What is quantization?**
Storing model weights as 8-bit integers instead of 32-bit floats. The model gets about 4× smaller to
download and faster to run, with only a small accuracy loss.

**Q: How did you make large audio transfers efficient?**
`postMessage` with a transfer list moves the `ArrayBuffer` to the worker without copying, and
`subarray()` gives each piece as a view of the same memory.

**Q: How do the SRT and VTT formats differ?**
Both are numbered/timed text blocks. SRT uses `00:00:01,000` (comma) and numbers every cue; VTT starts
with `WEBVTT` and uses a dot `00:00:01.000`. VTT is the web standard for `<track>`.

**Q: What was the hardest problem?**
Chunking long audio without breaking words, and stopping Whisper from inventing text on silence — solved
with energy-based cutting and skipping quiet pieces. Also keeping the app light: loading the AI library
from a pinned CDN build only on demand, instead of a huge npm dependency.
