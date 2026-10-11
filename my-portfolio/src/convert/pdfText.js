// Text-layout helpers for the PDF converters, on top of readPage()/toLines() from pdfToDocx.

import { loadPdfjs } from '../pdfjs'
import { readPage, toLines } from '../pdfToDocx'

export { readPage, toLines }

// Opens a PDF (throws pdf.js's PasswordException when a password is needed).
export async function openPdf(file, password) {
  const pdfjs = await loadPdfjs()
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), password: password || undefined }).promise
  return { pdfjs, pdf }
}

// Splits a line into cells wherever the gap between pieces is wider than `gap` × the font size.
export function splitCells(line, gap = 1.2) {
  const cells = []
  for (const it of line.items) {
    const cur = cells.at(-1)
    const space = cur ? it.x - cur.x1 : Infinity
    if (!cur || space > it.size * gap) {
      cells.push({ x0: it.x, x1: it.x + it.w, text: it.str, items: [it] })
    } else {
      cur.text += space > it.size * 0.15 && !/\s$/.test(cur.text) && !/^\s/.test(it.str) ? ` ${it.str}` : it.str
      cur.x1 = Math.max(cur.x1, it.x + it.w)
      cur.items.push(it)
    }
  }
  for (const c of cells) c.text = c.text.replace(/\s+/g, ' ').trim()
  return cells
}

// Turns a page's text into table rows: columns are the bands of x positions that cells occupy across the page.
export function tableRows(items) {
  const lines = toLines(items)
  const cellLines = lines.map((l) => splitCells(l))
  const all = cellLines.flat()
  if (!all.length) return []
  const left = Math.min(...all.map((c) => c.x0))
  const right = Math.max(...all.map((c) => c.x1))
  const wide = (right - left) * 0.35

  // Column bands come from rows with several cells; very wide cells (sentences) are ignored.
  const intervals = cellLines
    .filter((cells) => cells.length > 1)
    .flat()
    .filter((c) => c.x1 - c.x0 < wide)
    .map((c) => [c.x0, c.x1])
    .sort((a, b) => a[0] - b[0])
  const bands = []
  for (const [a, b] of intervals) {
    const last = bands.at(-1)
    if (last && a <= last[1] + 2) last[1] = Math.max(last[1], b)
    else bands.push([a, b])
  }
  if (!bands.length) return cellLines.map((cells) => [cells.map((c) => c.text).join(' ')])

  const column = (c) => {
    const mid = (c.x0 + c.x1) / 2
    let best = 0
    let bestDist = Infinity
    bands.forEach(([a, b], i) => {
      const d = mid < a ? a - mid : mid > b ? mid - b : 0
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }
  return cellLines.map((cells) => {
    // A line that is one wide piece of text (a title or sentence) goes in the first column.
    if (cells.length === 1 && cells[0].x1 - cells[0].x0 >= wide) return [cells[0].text]
    const row = []
    for (const c of cells) {
      const i = column(c)
      row[i] = row[i] ? `${row[i]} ${c.text}` : c.text
    }
    return Array.from({ length: Math.max(row.length, 1) }, (_, i) => row[i] ?? '')
  })
}
