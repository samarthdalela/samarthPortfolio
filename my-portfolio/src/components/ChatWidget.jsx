import { Fragment, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { answerQuestion } from '../data/chatAnswers'

// Quick-reply menu shown under every bot reply: button label → question it answers.
const topics = [
  ['Skills', 'skills'],
  ['Projects', 'projects'],
  ['Experience', 'experience'],
  ['Education', 'education'],
  ['Open to work?', 'open to opportunities'],
  ['Contact', 'contact'],
  ['Resume', 'resume'],
]

const greeting = {
  role: 'assistant',
  content: "Hi! 👋 I'm Samarth's assistant. Pick a topic below or type your question.",
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
  const timerRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const ask = (question, label = question) => {
    const q = question.trim()
    if (!q || busy) return
    const history = [...messages, { role: 'user', content: label.trim() }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)

    // Short pause so the typing indicator shows before the answer appears.
    timerRef.current = setTimeout(() => {
      setMessages([...history, { role: 'assistant', content: answerQuestion(q) }])
      setBusy(false)
    }, 400)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    ask(input)
  }

  const reset = () => {
    clearTimeout(timerRef.current)
    setBusy(false)
    setMessages([greeting])
  }

  return (
    <>
      <button
        className={`chat-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Ask about Samarth'}
        aria-expanded={open}
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
        {!open && <span className="chat-fab-text">Ask about me</span>}
      </button>

      {open && (
        <section className="chat-panel" role="dialog" aria-label="Chat assistant">
          <header className="chat-head">
            <span className="chat-avatar">SD</span>
            <div>
              <strong>Ask about Samarth</strong>
              <span>Assistant · answers from his resume</span>
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
            {!busy && (
              <div className="chat-suggestions">
                {topics.map(([label, question]) => (
                  <button key={label} onClick={() => ask(question, label)}>{label}</button>
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
          <p className="chat-note">For anything not covered here, contact Samarth directly.</p>
        </section>
      )}
    </>
  )
}

export default ChatWidget
