import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import Support from './Support'
import { SUPPORT_EVENT } from '../support'

const AUTO_DELAY_MS = 25000
const AUTO_KEY = 'supportPopupLastAuto' // auto-open at most once a day
const SESSION_KEY = 'supportPopupShown' // event-triggered open at most once per visit
const DAY_MS = 24 * 60 * 60 * 1000

const store = (s, key, value) => {
  try {
    if (value === undefined) return s.getItem(key)
    s.setItem(key, value)
  } catch {
    // storage unavailable: behave as if never shown
  }
  return null
}

function SupportPopup() {
  const dialogRef = useRef(null)
  const [open, setOpen] = useState(false)

  const show = useCallback(() => {
    const d = dialogRef.current
    if (!d || d.open) return
    d.showModal()
    setOpen(true)
    store(sessionStorage, SESSION_KEY, '1')
  }, [])

  const close = () => dialogRef.current?.close()

  useEffect(() => {
    // Suggest once per visit when the visitor gets value from a tool.
    const onPrompt = () => {
      if (!store(sessionStorage, SESSION_KEY)) setTimeout(show, 900)
    }
    window.addEventListener(SUPPORT_EVENT, onPrompt)

    // Otherwise open once a day after the visitor has spent a little time on the page.
    let timer
    const last = Number(store(localStorage, AUTO_KEY)) || 0
    if (Date.now() - last > DAY_MS) {
      timer = setTimeout(() => {
        if (store(sessionStorage, SESSION_KEY)) return
        store(localStorage, AUTO_KEY, String(Date.now()))
        show()
      }, AUTO_DELAY_MS)
    }
    return () => {
      window.removeEventListener(SUPPORT_EVENT, onPrompt)
      clearTimeout(timer)
    }
  }, [show])

  // Close when clicking the backdrop (outside the panel).
  const onDialogClick = (e) => {
    if (e.target === dialogRef.current) close()
  }

  return (
    <>
      <button
        className={`coffee-fab ${open ? 'is-hidden' : ''}`}
        onClick={show}
        aria-label="Buy me a chai or coffee"
      >
        <span aria-hidden="true">☕</span>
        <span className="coffee-fab-text">Buy me a coffee</span>
      </button>

      <dialog
        ref={dialogRef}
        className="support-dialog"
        aria-labelledby="support-popup-title"
        onClose={() => setOpen(false)}
        onClick={onDialogClick}
      >
        <div className="support-dialog-panel">
          <button className="icon-btn support-dialog-close" onClick={close} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
          {open && <Support inModal />}
          <button className="support-dialog-later" onClick={close}>
            Maybe later
          </button>
        </div>
      </dialog>
    </>
  )
}

export default SupportPopup
