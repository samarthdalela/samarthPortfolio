import { Fragment, useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const suggestions = [
  "What are Samarth's main skills?",
  'Tell me about his Kafka microservices project',
  'Is he open to new opportunities?',
  'How can I contact him?',
]

const greeting = {
  role: 'assistant',
  content: "Hi! I'm Samarth's AI assistant. Ask me anything about his skills, projects or experience.",
}

// Renders **bold**, `code`, links and emails as React nodes (never as raw HTML).
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (/^`[^`]+`$/.test(p)) return <code key={i}>{p.slice(1, -1)}</code>
    if (/^https?:\/\//.test(p)) {
      const url = p.replace(/[.,]$/, '')
      return (
        <Fragment key={i}>
          <a href={url} target="_blank" rel="noopener noreferrer">{url.replace(/^https?:\/\//, '')}</a>
          {p.slice(url.length)}
        </Fragment>
      )
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(p)) return <a key={i} href={`mailto:${p}`}>{p}</a>
    return <Fragment key={i}>{p}</Fragment>
  })
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([greeting])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  const ask = async (question) => {
    const q = question.trim()
    if (!q || busy) return
    const history = [...messages, { role: 'user', content: q }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller
    const setReply = (fn) =>
      setMessages((list) => {
        const next = [...list]
        const last = next[next.length - 1]
        next[next.length - 1] = { ...last, ...fn(last) }
        return next
      })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The greeting is UI-only; send the real conversation.
        body: JSON.stringify({ messages: history.filter((m) => m !== greeting) }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setReply((last) => ({ content: last.content + chunk }))
      }
      setReply((last) => (last.content ? {} : { content: 'Sorry, I could not answer that.', error: true }))
    } catch (err) {
      if (err.name !== 'AbortError') setReply(() => ({ content: err.message, error: true }))
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    ask(input)
  }

  const reset = () => {
    abortRef.current?.abort()
    setMessages([greeting])
  }

  return (
    <>
      <button
        className={`chat-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Ask AI about Samarth'}
        aria-expanded={open}
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
        {!open && <span className="chat-fab-text">Ask AI about me</span>}
      </button>

      {open && (
        <section className="chat-panel" role="dialog" aria-label="AI assistant">
          <header className="chat-head">
            <span className="chat-avatar">SD</span>
            <div>
              <strong>Ask about Samarth</strong>
              <span>AI assistant · powered by DeepSeek</span>
            </div>
            <button className="icon-btn" onClick={reset} aria-label="New chat" title="New chat">
              <Icon name="refresh" size={16} />
            </button>
          </header>

          <div className="chat-list" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role} ${m.error ? 'is-error' : ''}`}>
                {m.content ? <RichText text={m.content} /> : <span className="chat-typing"><i /><i /><i /></span>}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, projects…"
              maxLength={1500}
              aria-label="Your question"
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()} aria-label="Send">
              <Icon name="send" size={18} />
            </button>
          </form>
          <p className="chat-note">AI can make mistakes — check important details with Samarth.</p>
        </section>
      )}
    </>
  )
}

export default ChatWidget
