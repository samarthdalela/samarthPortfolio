// PDF → Word (.docx), entirely in the browser.
//
// A PDF only stores positioned pieces of text, not paragraphs. readPage() collects those pieces with pdf.js,
// and buildDocx() rebuilds lines → paragraphs from their positions (with fonts, bold/italic, sizes, indents,
// alignment and spacing), then writes a real .docx. Pages without real text (scans) and the "exact layout"
// mode insert the rendered page as a picture instead.

import { renderPage } from './pdfjs'

// Common PDF font names → the font Word should use.
const knownFonts = {
  times: 'Times New Roman',
  timesnewroman: 'Times New Roman',
  timesroman: 'Times New Roman',
  arial: 'Arial',
  arialnarrow: 'Arial Narrow',
  helvetica: 'Arial',
  helveticaneue: 'Arial',
  calibri: 'Calibri',
  calibrilight: 'Calibri Light',
  cambria: 'Cambria',
  candara: 'Candara',
  georgia: 'Georgia',
  verdana: 'Verdana',
  tahoma: 'Tahoma',
  courier: 'Courier New',
  couriernew: 'Courier New',
  garamond: 'Garamond',
  bookantiqua: 'Book Antiqua',
  centurygothic: 'Century Gothic',
  palatino: 'Palatino Linotype',
  palatinolinotype: 'Palatino Linotype',
  trebuchetms: 'Trebuchet MS',
  segoeui: 'Segoe UI',
  liberationserif: 'Times New Roman',
  liberationsans: 'Arial',
  symbol: 'Symbol',
  wingdings: 'Wingdings',
}

function fontInfo(font) {
  const raw = (font?.name || '').replace(/^[A-Z]{6}\+/, '')
  const lower = raw.toLowerCase()
  const bold = !!(font?.bold || font?.black) || /bold|black|heavy|semibold|demi/.test(lower)
  const italic = !!font?.italic || /italic|oblique/.test(lower)
  const base = raw.split(/[-,]/)[0].replace(/(PS)?MT$|PS$/, '')
  const key = base.toLowerCase().replace(/[^a-z]/g, '')
  const family = knownFonts[key] || (/^[A-Za-z ]{3,}$/.test(base) ? base.replace(/([a-z])([A-Z])/g, '$1 $2') : '')
  return { family, bold, italic }
}

// Collects the text on one page as positioned pieces (coordinates in points, y = baseline from the top).
export async function readPage(pdfjs, page) {
  const viewport = page.getViewport({ scale: 1 })
  await page.getOperatorList() // loads the page's fonts, so their real names and styles can be read
  const content = await page.getTextContent()
  const fonts = {}
  const fontOf = (name) => (fonts[name] ??= fontInfo(page.commonObjs.has(name) ? page.commonObjs.get(name) : null))
  const items = []
  for (const item of content.items) {
    if (!item.str || !item.str.trim()) continue
    const t = pdfjs.Util.transform(viewport.transform, item.transform)
    if (Math.abs(t[1]) > Math.abs(t[0])) continue // skip vertical/rotated text
    const size = Math.hypot(t[2], t[3])
    if (size < 1) continue
    items.push({ str: item.str, x: t[4], y: t[5], w: item.width, size, ...fontOf(item.fontName) })
  }
  const chars = items.reduce((n, it) => n + it.str.trim().length, 0)
  return { width: viewport.width, height: viewport.height, items, chars }
}

// Groups pieces into lines, then lines into paragraphs.
function toLines(items) {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x)
  const lines = []
  for (const it of sorted) {
    const line = lines.at(-1)
    if (line && Math.abs(it.y - line.y) < Math.min(line.size, it.size) * 0.5) {
      line.items.push(it)
      line.size = Math.max(line.size, it.size)
    } else {
      lines.push({ y: it.y, size: it.size, items: [it] })
    }
  }
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x)
    line.x = line.items[0].x
    line.right = Math.max(...line.items.map((it) => it.x + it.w))
    line.text = line.items.map((it) => it.str).join('')
  }
  return lines
}

const bulletRe = /^\s*([•◦▪▫●○■□➢►✓✔\-–*]|\(?\d{1,3}[.)]|\(?[a-zA-Z][.)])\s/

function toParagraphs(lines, m) {
  const paras = []
  let para = null
  let prev = null
  for (const line of lines) {
    const gap = prev ? line.y - prev.y : 0
    const textWidth = m.right - m.left
    const prevShort = prev && prev.right - prev.x < textWidth * 0.7 && prev.right < m.right - line.size * 6
    const indentPattern = para && para.lines.length === 1 && line.x < para.lines[0].x - line.size * 0.5
    const start =
      !para ||
      gap > Math.max(prev.size, line.size) * 1.75 ||
      Math.abs(line.size - prev.size) > 1.2 ||
      (Math.abs(line.x - para.x) > line.size * 0.8 && !indentPattern) ||
      prevShort ||
      bulletRe.test(line.text) ||
      // A bold line in a non-body size (a sub-heading) never continues the paragraph above it.
      (prev.items.at(-1).bold !== line.items[0].bold && Math.round(line.size) !== m.body)
    if (start) {
      para = { lines: [line], x: line.x, firstX: line.x, gapBefore: prev ? gap - prev.size * 1.2 : line.y - line.size - m.top }
      paras.push(para)
    } else {
      para.lines.push(line)
      if (indentPattern) para.x = line.x
    }
    prev = line
  }
  return paras
}

// Merges a paragraph's pieces into runs of the same font, size and style.
function toRuns(para) {
  const runs = []
  const add = (text, it) => {
    const last = runs.at(-1)
    if (last && !last.tab && last.family === it.family && last.bold === it.bold && last.italic === it.italic && Math.abs(last.size - it.size) < 0.6) {
      last.text += text
    } else {
      runs.push({ text, family: it.family, bold: it.bold, italic: it.italic, size: it.size })
    }
  }
  para.lines.forEach((line, li) => {
    line.items.forEach((it, i) => {
      let text = it.str
      if (i > 0) {
        const before = line.items[i - 1]
        const space = it.x - (before.x + before.w)
        if (space > it.size * 2.5) {
          runs.push({ tab: true })
        } else if (space > it.size * 0.15 && !/\s$/.test(before.str) && !/^\s/.test(text)) {
          text = ' ' + text
        }
      } else if (li > 0) {
        // Joining two lines: drop a line-end hyphen before a lowercase word, otherwise add a space.
        const last = runs.at(-1)
        if (last && !last.tab && /[a-z]-$/.test(last.text) && /^[a-z]/.test(text)) last.text = last.text.slice(0, -1)
        else if (last && !last.tab && !/\s$/.test(last.text)) text = ' ' + text
      }
      add(text, it)
    })
  })
  return runs
}

// Drops characters XML 1.0 does not allow (control codes, unpaired surrogates) — PDFs sometimes contain them.
const xmlAllowed = (c) => c === 9 || c === 10 || c === 13 || (c >= 32 && c < 0xd800) || (c > 0xdfff && c < 0xfffe) || c > 0xffff
const xmlSafe = (s) => [...s].filter((ch) => xmlAllowed(ch.codePointAt(0))).join('')
const esc = (s) => xmlSafe(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const twips = (pt) => Math.max(0, Math.round(pt * 20))
const EMU_PER_PT = 12700

function runXml(r) {
  if (r.tab) return '<w:r><w:tab/></w:r>'
  const halfPts = Math.max(2, Math.round(r.size * 2))
  const font = r.family ? `<w:rFonts w:ascii="${esc(r.family)}" w:hAnsi="${esc(r.family)}" w:cs="${esc(r.family)}" w:eastAsia="${esc(r.family)}"/>` : ''
  return (
    `<w:r><w:rPr>${font}${r.bold ? '<w:b/><w:bCs/>' : ''}${r.italic ? '<w:i/><w:iCs/>' : ''}` +
    `<w:sz w:val="${halfPts}"/><w:szCs w:val="${halfPts}"/></w:rPr><w:t xml:space="preserve">${esc(r.text)}</w:t></w:r>`
  )
}

function paragraphXml(para, m, pageBreak) {
  const size = Math.max(...para.lines.map((l) => l.size))
  const props = []
  if (pageBreak) props.push('<w:pageBreakBefore/>')

  const before = Math.min(Math.max(0, para.gapBefore), 144)
  let spacing = `<w:spacing w:before="${before > 2 ? twips(before) : 0}" w:after="0"`
  if (para.lines.length > 1) {
    // Proportional ("auto") spacing: Word's single spacing is about 1.15× the font size.
    const pitch = (para.lines.at(-1).y - para.lines[0].y) / (para.lines.length - 1)
    const ratio = pitch / (size * 1.15)
    if (ratio > 1.08) spacing += ` w:line="${Math.round(240 * Math.min(ratio, 3))}" w:lineRule="auto"`
  }
  props.push(spacing + '/>')

  const centre = (m.left + m.right) / 2
  const isCentred = (l) => Math.abs((l.x + l.right) / 2 - centre) < 6 && l.x - m.left > 24
  const isRight = (l) => Math.abs(l.right - m.right) < 4 && l.x - m.left > (m.right - m.left) * 0.3
  const fullLines = para.lines.slice(0, -1)
  const align = para.lines.every(isCentred)
    ? 'center'
    : para.lines.every(isRight)
      ? 'right'
      : fullLines.length >= 1 && fullLines.every((l) => Math.abs(l.right - m.right) < 3)
        ? 'both'
        : ''

  // Indents only make sense for left-aligned and justified text; centred/right text sits where it is aligned.
  const left = para.x - m.left
  const first = para.firstX - para.x
  if ((align === '' || align === 'both') && (left > 4 || Math.abs(first) > 4)) {
    const firstAttr = first > 4 ? ` w:firstLine="${twips(first)}"` : first < -4 ? ` w:hanging="${twips(-first)}"` : ''
    props.push(`<w:ind w:left="${twips(Math.max(0, left))}"${firstAttr}/>`)
  }
  if (align) props.push(`<w:jc w:val="${align}"/>`)

  // Big text becomes a heading level, so Word's navigation pane and table of contents work.
  if (size >= m.body * 1.6) props.push('<w:outlineLvl w:val="0"/>')
  else if (size >= m.body * 1.25) props.push('<w:outlineLvl w:val="1"/>')

  return `<w:p><w:pPr>${props.join('')}</w:pPr>${toRuns(para).map(runXml).join('')}</w:p>`
}

function imageXml(rid, n, wPt, hPt, pageBreak) {
  const cx = Math.round(wPt * EMU_PER_PT)
  const cy = Math.round(hPt * EMU_PER_PT)
  return (
    `<w:p><w:pPr>${pageBreak ? '<w:pageBreakBefore/>' : ''}<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>` +
    `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
    `<wp:docPr id="${n}" name="Page ${n}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="page${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
    `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
  )
}

// Body text size = the size used by the most characters.
function bodySize(pages) {
  const counts = {}
  for (const p of pages) for (const it of p.items) counts[Math.round(it.size)] = (counts[Math.round(it.size)] || 0) + it.str.length
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return best ? Number(best[0]) : 11
}

// Page margins, taken from where the text sits across the whole document.
function margins(pages, width) {
  const all = pages.flatMap((p) => p.lines || [])
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  if (!all.length) return { left: 72, right: width - 72, top: 72, bottom: 72 }
  const left = clamp(Math.min(...all.map((l) => l.x)), 18, 144)
  const right = width - clamp(width - Math.max(...all.map((l) => l.right)), 18, 144)
  const top = clamp(Math.min(...all.map((l) => l.y - l.size)), 18, 144)
  return { left, right, top, bottom: clamp(top, 18, 108) }
}

const jpegBytes = async (canvas) =>
  new Uint8Array(await (await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85))).arrayBuffer())

// pages: [{ page (pdf.js), width, height, items, chars }]. mode: 'text' | 'image'.
// onProgress(i) is called after each page. Returns { blob, textPages, imagePages, paragraphs }.
export async function buildDocx(pages, mode, onProgress = () => {}) {
  const { default: JSZip } = await import('jszip')
  const { width, height } = pages[0]
  const scanned = (p) => p.chars < 30
  for (const p of pages) p.lines = mode === 'text' && !scanned(p) ? toLines(p.items) : []
  const m = mode === 'image' ? { left: 0, right: width, top: 0, bottom: 0 } : margins(pages, width)
  m.body = bodySize(pages)

  const zip = new JSZip()
  const body = []
  const rels = []
  let images = 0
  let paragraphs = 0
  let textPages = 0

  for (const [i, p] of pages.entries()) {
    if (p.lines.length) {
      textPages++
      toParagraphs(p.lines, m).forEach((para, pi) => {
        body.push(paragraphXml(para, m, i > 0 && pi === 0))
        paragraphs++
      })
    } else {
      const canvas = await renderPage(p.page, 150 / 72)
      const n = ++images
      zip.file(`word/media/page${n}.jpeg`, await jpegBytes(canvas))
      rels.push(`<Relationship Id="rIdImg${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${n}.jpeg"/>`)
      // Fit inside the printable area; 2pt slack stops Word pushing an empty line onto a new page.
      const maxW = m.right - m.left
      const maxH = height - m.top - m.bottom - 2
      const k = Math.min(maxW / p.width, maxH / p.height)
      body.push(imageXml(`rIdImg${n}`, n, p.width * k, p.height * k, i > 0))
    }
    onProgress(i + 1)
  }

  const landscape = width > height ? ' w:orient="landscape"' : ''
  const sect =
    `<w:sectPr><w:pgSz w:w="${twips(width)}" w:h="${twips(height)}"${landscape}/>` +
    `<w:pgMar w:top="${twips(m.top)}" w:right="${twips(width - m.right)}" w:bottom="${twips(m.bottom)}" w:left="${twips(m.left)}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`

  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  zip.file(
    'word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      rels.join('') +
      '</Relationships>',
  )
  zip.file(
    'word/styles.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>' +
      `<w:sz w:val="${m.body * 2}"/><w:szCs w:val="${m.body * 2}"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault>` +
      '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>',
  )
  zip.file(
    'word/document.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
      'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      `<w:body>${body.join('')}${sect}</w:body></w:document>`,
  )

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  return { blob, textPages, imagePages: images, paragraphs }
}
