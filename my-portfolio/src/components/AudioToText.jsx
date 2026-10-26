import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { promptSupport } from '../support'
import { clock, decodeAudio, SAMPLE_RATE, toDocx, toSrt, toText, toVtt } from '../transcribe'
import { languages, models } from '../data/audioToText'

const formatBytes = (b) => (b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`)
const isMedia = (f) => /^(audio|video)\//.test(f.type) || /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|webm|weba|mp4|m4v|mov|mkv|3gp|amr|wma)$/i.test(f.name)

// Audio / video → text with Whisper, run in a worker on the user's device (src/transcribeWorker.js).
// `language` and `model` preset the dropdowns (used by landing pages like Hindi audio to text).
function AudioToText({ language: presetLanguage = '', model: presetModel = 'whisper-base' }) {
  const [file, setFile] = useState(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [model, setModel] = useState(presetModel)
  const [language, setLanguage] = useState(presetLanguage)
  const [task, setTask] = useState('transcribe')
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [segments, setSegments] = useState([])
  const [finished, setFinished] = useState(false)
  const [withTimes, setWithTimes] = useState(true)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [recording, setRecording] = useState(0)
  const inputRef = useRef(null)
  const playerRef = useRef(null)
  const workerRef = useRef(null)
  const recorderRef = useRef(null)
  // Bumped on every start or cancel, so a cancelled run stops quietly.
  const runId = useRef(0)

  useEffect(() => () => workerRef.current?.terminate(), [])
  useEffect(() => () => mediaUrl && URL.revokeObjectURL(mediaUrl), [mediaUrl])
  // Recording timer.
  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setRecording((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => {
    runId.current++
    workerRef.current?.terminate()
    workerRef.current = null
    setStatus('')
  }

  const choose = (f) => {
    stop()
    setFile(f)
    setMediaUrl(URL.createObjectURL(f))
    setSegments([])
    setFinished(false)
    setError('')
  }

  const addFile = (fileList) => {
    const f = [...fileList].find(isMedia)
    if (f) choose(f)
    else setError('Please choose an audio or video file (MP3, WAV, M4A, OGG, WebM, MP4…).')
  }

  const record = async () => {
    if (recorderRef.current) {
      recorderRef.current.stop()
      return
    }
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const parts = []
      rec.ondataavailable = (e) => parts.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        recorderRef.current = null
        setRecording(0)
        const type = rec.mimeType || 'audio/webm'
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        const stamp = new Date().toTimeString().slice(0, 8).replace(/:/g, '-')
        choose(new File(parts, `recording-${stamp}.${ext}`, { type }))
      }
      rec.start()
      recorderRef.current = rec
      setRecording(1)
    } catch {
      setError('Could not use the microphone. Allow microphone access in your browser and try again.')
    }
  }

  const transcribe = async () => {
    stop()
    const id = runId.current
    setSegments([])
    setFinished(false)
    setError('')
    setProgress(0)
    setStatus('Reading the recording…')
    let audio
    try {
      audio = await decodeAudio(file)
    } catch {
      if (runId.current !== id) return
      setStatus('')
      setError('This file could not be read. Try converting it to MP3 or WAV, or use a different browser.')
      return
    }
    if (runId.current !== id) return
    const minutes = audio.length / SAMPLE_RATE / 60
    const worker = new Worker(new URL('../transcribeWorker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker
    const pieces = []
    let total = 1
    setStatus('Loading the speech model…')
    worker.onmessage = ({ data }) => {
      if (workerRef.current !== worker) return
      if (data.type === 'download') {
        setStatus(`Downloading the speech model (one time only): ${formatBytes(data.loaded)} of ${formatBytes(data.total)}`)
        setProgress(data.loaded / data.total)
      } else if (data.type === 'start') {
        total = data.total
        setProgress(0)
        setStatus(`Transcribing ${clock(minutes * 60)} of audio…`)
      } else if (data.type === 'piece') {
        pieces[data.index] = data.segments
        setSegments(pieces.flat())
        setProgress((data.index + 1) / total)
        setStatus(`Transcribing… ${Math.round(((data.index + 1) / total) * 100)}%`)
      } else if (data.type === 'done') {
        stop()
        setFinished(true)
        if (!pieces.flat().length) setError('No speech was found in this recording.')
      } else if (data.type === 'error') {
        stop()
        setError('Transcription failed — your device may be low on memory. Try the “Fast” option or a shorter recording.')
      }
    }
    worker.onerror = () => {
      stop()
      setError('The speech model could not be loaded. Check your internet connection and try again.')
    }
    worker.postMessage({ audio, model, language, task }, [audio.buffer])
  }

  const edit = (i, text) => setSegments((s) => s.map((seg, j) => (j === i ? { ...seg, text } : seg)))

  const seek = (sec) => {
    const p = playerRef.current
    if (!p) return
    p.currentTime = sec
    p.play()
  }

  const baseName = file ? file.name.replace(/\.[^.]+$/, '') : 'transcript'
  const save = (blob, ext) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${baseName}.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    promptSupport()
  }
  const downloads = [
    { ext: 'txt', label: 'TXT', make: () => new Blob([toText(segments, withTimes)], { type: 'text/plain;charset=utf-8' }) },
    { ext: 'docx', label: 'Word', make: () => toDocx(segments, baseName, withTimes) },
    { ext: 'srt', label: 'SRT', make: () => new Blob([toSrt(segments)], { type: 'application/x-subrip;charset=utf-8' }) },
    { ext: 'vtt', label: 'VTT', make: () => new Blob([toVtt(segments)], { type: 'text/vtt;charset=utf-8' }) },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toText(segments, withTimes))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Copy failed — select the text and copy it manually.')
    }
  }

  const busy = !!status
  const Player = file?.type.startsWith('video/') ? 'video' : 'audio'

  return (
    <div className="qr-tool card resizer">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-files' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!busy) addFile(e.dataTransfer.files)
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !busy && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac,.webm,.mp4,.mov,.mkv"
          hidden
          onChange={(e) => {
            addFile(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="dropzone-icon"><Icon name="mic" size={28} /></span>
        <strong>
          {file ? `${file.name} · ${formatBytes(file.size)} — click to choose another file` : 'Drop an audio or video file here or click to browse'}
        </strong>
        {!file && <span className="muted">MP3, WAV, M4A, OGG, OPUS, WebM, MP4 · transcribed on your device · nothing is uploaded</span>}
      </div>

      <div className="qr-body resizer-body">
        <div className="qr-form">
          <button className={`btn ${recording ? 'btn-primary att-recording' : 'btn-ghost'}`} onClick={record} disabled={busy}>
            <Icon name="mic" size={18} /> {recording ? `Stop recording · ${clock(recording - 1)}` : 'Record from microphone'}
          </button>

          {mediaUrl && <Player ref={playerRef} src={mediaUrl} controls className="att-player" />}

          <label>
            <span>Language spoken</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={busy}>
              {languages.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Output</span>
            <select value={task} onChange={(e) => setTask(e.target.value)} disabled={busy}>
              <option value="transcribe">Text in the spoken language</option>
              <option value="translate">Translate to English</option>
            </select>
          </label>
          <label>
            <span>Accuracy</span>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={busy}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          {language && language !== 'en' && model !== 'whisper-small' && (
            <p className="muted small">Tip: “Most accurate” gives much better results for Hindi and other Indian languages.</p>
          )}

          {status && (
            <div className="att-progress" role="status">
              <span className="resize-summary">{status}</span>
              <span className="att-bar"><span style={{ width: `${Math.round(progress * 100)}%` }} /></span>
            </div>
          )}
          {finished && segments.length > 0 && (
            <p className="resize-summary">
              <Icon name="check" size={16} /> Done: <strong>{segments.length} lines</strong> — edit any line, then download.
            </p>
          )}
          {error && <p className="resize-error">{error}</p>}

          <div className="qr-actions resizer-actions">
            {busy ? (
              <button className="btn btn-ghost" onClick={stop}>
                Cancel
              </button>
            ) : (
              <button className="btn btn-primary" onClick={transcribe} disabled={!file || !!recording}>
                {finished ? 'Transcribe again' : 'Transcribe to text'}
              </button>
            )}
          </div>
          <p className="qr-privacy">
            <Icon name="lock" size={14} /> Your recording is transcribed on your device. Nothing is uploaded.
          </p>
        </div>

        <div className="att-result">
          <div className="att-result-head">
            <strong>Transcript</strong>
            <label className="att-toggle">
              <input type="checkbox" checked={withTimes} onChange={(e) => setWithTimes(e.target.checked)} /> Timestamps
            </label>
          </div>
          <div className="resize-list att-lines">
            {!segments.length && (
              <p className="muted resize-empty">{busy ? status : 'Your transcript will appear here, line by line.'}</p>
            )}
            {segments.map((s, i) => (
              <div key={i} className="att-line">
                {withTimes && (
                  <button className="att-time" onClick={() => seek(s.start)} title="Play from here">
                    {clock(s.start)}
                  </button>
                )}
                <textarea
                  value={s.text}
                  onChange={(e) => edit(i, e.target.value)}
                  rows={Math.max(1, Math.ceil(s.text.length / 52))}
                  aria-label={`Line ${i + 1}`}
                  readOnly={busy}
                />
              </div>
            ))}
          </div>
          {segments.length > 0 && (
            <div className="att-downloads">
              <button className="btn btn-ghost" onClick={copy} disabled={busy}>
                <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Copied' : 'Copy text'}
              </button>
              {downloads.map((d) => (
                <button key={d.ext} className="btn btn-ghost" onClick={async () => save(await d.make(), d.ext)} disabled={busy}>
                  <Icon name="download" size={16} /> {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioToText
