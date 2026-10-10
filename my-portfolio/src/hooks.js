import { useEffect, useRef, useState } from 'react'

// Adds `is-visible` to every `.reveal` element once it scrolls into view.
export function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// Returns the id of the section currently in view.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

// Cycles through words with a typing / deleting effect.
export function useTypewriter(words, { typeMs = 70, deleteMs = 40, holdMs = 1600 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index % words.length]
    let delay = deleting ? deleteMs : typeMs
    if (!deleting && text === word) delay = holdMs

    const t = setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true)
      } else if (deleting && text === '') {
        setDeleting(false)
        setIndex((i) => i + 1)
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)))
      }
    }, delay)
    return () => clearTimeout(t)
  }, [text, deleting, index, words, typeMs, deleteMs, holdMs])

  return text
}

// Shows `target` (so pre-rendered HTML has real numbers), then counts up from 0 once visible.
export function useCountUp(target, decimals = 0, duration = 1400) {
  const ref = useRef(null)
  const [value, setValue] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Number((target * eased).toFixed(decimals)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, decimals, duration])

  return [ref, value]
}

// Light / dark theme, remembered per browser.
export function useTheme() {
  // The inline script in index.html sets data-theme before React loads.
  const [theme, setTheme] = useState(() =>
    typeof document === 'undefined' ? 'dark' : document.documentElement.dataset.theme || 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable
    }
  }, [theme])

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
