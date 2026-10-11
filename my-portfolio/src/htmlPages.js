// Lays HTML blocks out into fixed-size pages (like a word processor), then turns the pages into a PDF.
//
// Blocks flow onto a page until it is full. A table that does not fit is split between rows (repeating its
// header row on the next page when it has data-repeat-header). Any other block that does not fit is split at a
// line boundary: the next page shows the same block shifted up, so no line of text is cut in half.
// A block with data-break="before" always starts a new page.

import { buildPdf } from './pdfWriter'
import { areaOf, captureArea, createStage, printHtml } from './pageCapture'

const pageCss = (s) => `
#STAGE .hp-page { width: ${s.pageW}px; height: ${s.pageH}px; padding: ${s.margin}px; box-sizing: border-box;
  background: #fff; overflow: hidden; position: relative }
#STAGE .hp-content { overflow: hidden }
#STAGE .hp-content > :first-child { margin-top: 0 }
#STAGE .hp-content img { max-width: 100%; max-height: ${s.pageH - s.margin * 2}px; object-fit: contain }
#STAGE .hp-slice { overflow: hidden }
${s.css || ''}`

export function paginate(blocks, settings) {
  const stage = createStage(pageCss(settings))
  const available = settings.pageH - settings.margin * 2
  const pages = []
  let content

  const newPage = () => {
    const page = document.createElement('div')
    page.className = 'hp-page'
    content = document.createElement('div')
    content.className = 'hp-content'
    page.append(content)
    stage.body.append(page)
    pages.push(page)
  }
  const used = () => content.scrollHeight
  const fits = () => used() <= available + 0.5
  const lineHeight = (el) => {
    const cs = getComputedStyle(el)
    return parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16
  }

  // Places a block that is too tall for the space left, splitting it across as many pages as needed.
  const placeSplit = (block) => {
    if (block.tagName === 'TABLE' && block.tBodies.length) {
      const rows = [...block.querySelectorAll(':scope > tbody > tr, :scope > tr')]
      const header = block.dataset.repeatHeader !== undefined ? rows[0] : null
      let i = 0
      while (i < rows.length) {
        const part = block.cloneNode(false)
        const body = document.createElement('tbody')
        part.append(body)
        if (header && i > 0) body.append(header.cloneNode(true))
        content.append(part)
        let added = 0
        while (i < rows.length) {
          body.append(rows[i])
          if (!fits()) {
            body.removeChild(rows[i])
            break
          }
          i++
          added++
        }
        if (added === 0) {
          content.removeChild(part)
          if (content.childNodes.length) {
            newPage()
            continue
          }
          // A single row taller than a page: slice it like any other block.
          const one = block.cloneNode(false)
          const b = document.createElement('tbody')
          b.append(rows[i++])
          one.append(b)
          placeSlices(one)
          continue
        }
        if (i < rows.length) newPage()
      }
      return
    }
    placeSlices(block)
  }

  const placeSlices = (block) => {
    // Measure the full height once on a fresh page.
    content.append(block)
    const total = block.getBoundingClientRect().height
    content.removeChild(block)
    const lh = lineHeight(block)
    let offset = 0
    while (offset < total - 1) {
      const room = available - (content.childNodes.length ? used() : 0)
      let show = Math.floor(room / lh) * lh
      if (show < lh) {
        newPage()
        continue
      }
      show = Math.min(show, total - offset)
      const slice = document.createElement('div')
      slice.className = 'hp-slice'
      slice.style.height = `${show}px`
      const copy = block.cloneNode(true)
      copy.style.marginTop = `${-offset}px`
      slice.append(copy)
      content.append(slice)
      offset += show
      if (offset < total - 1) newPage()
    }
  }

  newPage()
  for (const block of blocks) {
    if (block.dataset?.break === 'before' && content.childNodes.length) newPage()
    content.append(block)
    if (fits()) continue
    const tall = block.getBoundingClientRect().height > available / 2
    content.removeChild(block)
    // Small blocks move whole to the next page (keeps short paragraphs together); tables and tall blocks
    // start splitting in the space that is left, so no half-empty pages.
    if (content.childNodes.length && block.tagName !== 'TABLE' && !tall) {
      newPage()
      content.append(block)
      if (fits()) continue
      content.removeChild(block)
    }
    placeSplit(block)
  }
  if (!content.childNodes.length && pages.length > 1) {
    pages.pop().remove()
  }
  return { stage, pages }
}

// Captures laid-out pages into a PDF. onProgress(i, n) is called before each page.
export async function pagesToPdf({ stage, pages }, settings, quality, onProgress = () => {}, isStale = () => false) {
  const pdfPages = []
  const thumbs = []
  for (const [i, page] of pages.entries()) {
    onProgress(i + 1, pages.length)
    const { img, thumb } = await captureArea(page, stage.stage.id, areaOf(page), quality)
    if (isStale()) return null
    const pw = settings.pageW * 0.75
    const ph = settings.pageH * 0.75
    pdfPages.push({ img, pw, ph, x: 0, y: 0, dw: pw, dh: ph })
    thumbs.push(thumb)
  }
  return { blob: buildPdf(pdfPages), thumbs }
}

// Opens the browser's print dialog for the laid-out pages, so "Save as PDF" keeps text selectable.
export function printPages({ stage }, settings, title) {
  printHtml({
    title,
    head: `<style>${stage.style.textContent.replaceAll(`#${stage.stage.id}`, 'body')}
body .hp-page { break-after: page }</style>`,
    body: stage.body.innerHTML,
    pageW: settings.pageW,
    pageH: settings.pageH,
  })
}

// Builds a DOM element from an HTML string.
export function el(html) {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
