// ODT (OpenDocument Text, from LibreOffice / OpenOffice / Google Docs) → DOCX (Word).
// Reads content.xml and styles.xml and rebuilds paragraphs, headings, character formatting, lists, tables,
// images, page breaks, page size and margins as WordprocessingML.

import { createMedia, esc, imageRun, twips, writeDocx } from '../docxWriter'
import { baseName, formatBytes, userError } from './common'

const NS = {
  office: 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
  style: 'urn:oasis:names:tc:opendocument:xmlns:style:1.0',
  text: 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  table: 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  draw: 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
  fo: 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0',
  svg: 'urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0',
  xlink: 'http://www.w3.org/1999/xlink',
}
const attr = (node, ns, name) => node?.getAttributeNS?.(NS[ns], name) || null
const kids = (node) => [...(node?.childNodes || [])]
const is = (node, ns, name) => node.nodeType === 1 && node.namespaceURI === NS[ns] && node.localName === name
const childEl = (node, ns, name) => kids(node).find((n) => is(n, ns, name))

// "2.54cm" / "10mm" / "1in" / "12pt" / "16px" / "1pc" → points.
function toPt(v) {
  const m = /^(-?[\d.]+)\s*(cm|mm|in|pt|px|pc)?$/.exec(String(v || '').trim())
  if (!m) return null
  const n = parseFloat(m[1])
  return { cm: n * 28.3465, mm: n * 2.83465, in: n * 72, pt: n, px: n * 0.75, pc: n * 12 }[m[2] || 'pt']
}

function readStyles(docs) {
  const fonts = {}
  const styles = {}
  const listStyles = {}
  const defaults = {}
  let pageLayout = null
  for (const doc of docs) {
    for (const f of doc.getElementsByTagNameNS(NS.style, 'font-face')) {
      fonts[attr(f, 'style', 'name')] = (attr(f, 'svg', 'font-family') || attr(f, 'style', 'name')).replace(/['"]/g, '')
    }
    for (const s of doc.getElementsByTagNameNS(NS.style, 'style')) {
      styles[`${attr(s, 'style', 'family')}:${attr(s, 'style', 'name')}`] = s
    }
    for (const s of doc.getElementsByTagNameNS(NS.style, 'default-style')) {
      defaults[attr(s, 'style', 'family')] = s
    }
    for (const l of doc.getElementsByTagNameNS(NS.text, 'list-style')) listStyles[attr(l, 'style', 'name')] = l
    if (!pageLayout) pageLayout = doc.getElementsByTagNameNS(NS.style, 'page-layout-properties')[0] || null
  }
  return { fonts, styles, listStyles, defaults, pageLayout }
}

// Character and paragraph formatting of a style, including what it inherits.
function resolveStyle(ctx, family, name, seen = new Set()) {
  const key = `${family}:${name}`
  if (ctx.cache[key]) return ctx.cache[key]
  const node = ctx.styles[key]
  const base = node && !seen.has(key) && attr(node, 'style', 'parent-style-name')
    ? resolveStyle(ctx, family, attr(node, 'style', 'parent-style-name'), seen.add(key))
    : { run: {}, para: {}, listStyle: null, heading: null }
  const out = { run: { ...base.run }, para: { ...base.para }, listStyle: base.listStyle, heading: base.heading }
  if (node) {
    readTextProps(ctx, childEl(node, 'style', 'text-properties'), out.run)
    readParaProps(childEl(node, 'style', 'paragraph-properties'), out.para)
    out.listStyle = attr(node, 'style', 'list-style-name') || out.listStyle
    const display = (attr(node, 'style', 'display-name') || attr(node, 'style', 'name') || '').toLowerCase()
    const level = /heading[ _]?(\d)/.exec(display)
    if (level) out.heading = Number(level[1])
  }
  ctx.cache[key] = out
  return out
}

function readTextProps(ctx, p, run) {
  if (!p) return
  const weight = attr(p, 'fo', 'font-weight')
  if (weight) run.b = weight === 'bold' || Number(weight) >= 600
  const fstyle = attr(p, 'fo', 'font-style')
  if (fstyle) run.i = fstyle === 'italic' || fstyle === 'oblique'
  const ul = attr(p, 'style', 'text-underline-style')
  if (ul) run.u = ul !== 'none'
  const strike = attr(p, 'style', 'text-line-through-style')
  if (strike) run.s = strike !== 'none'
  const size = attr(p, 'fo', 'font-size')
  if (size && !size.endsWith('%')) run.size = toPt(size)
  const color = attr(p, 'fo', 'color')
  if (color && /^#[0-9a-f]{6}$/i.test(color)) run.color = color.slice(1).toUpperCase()
  const font = attr(p, 'style', 'font-name') || attr(p, 'fo', 'font-family')
  if (font) run.font = ctx.fonts[font] || font.replace(/['"]/g, '')
  const pos = attr(p, 'style', 'text-position')
  if (pos) run.va = pos.startsWith('super') || parseFloat(pos) > 0 ? 'superscript' : pos.startsWith('sub') || parseFloat(pos) < 0 ? 'subscript' : null
}

function readParaProps(p, para) {
  if (!p) return
  const align = attr(p, 'fo', 'text-align')
  if (align) para.align = { start: '', left: '', center: 'center', end: 'right', right: 'right', justify: 'both' }[align] ?? ''
  for (const [prop, key] of [['margin-left', 'left'], ['text-indent', 'first'], ['margin-top', 'before'], ['margin-bottom', 'after']]) {
    const v = toPt(attr(p, 'fo', prop))
    if (v !== null) para[key] = v
  }
  if (attr(p, 'fo', 'break-before') === 'page') para.pageBreak = true
  const lh = attr(p, 'fo', 'line-height')
  if (lh?.endsWith('%')) para.line = parseFloat(lh) / 100
}

function runXml(text, r) {
  const props = []
  if (r.font) props.push(`<w:rFonts w:ascii="${esc(r.font)}" w:hAnsi="${esc(r.font)}" w:cs="${esc(r.font)}" w:eastAsia="${esc(r.font)}"/>`)
  if (r.b) props.push('<w:b/><w:bCs/>')
  if (r.i) props.push('<w:i/><w:iCs/>')
  if (r.s) props.push('<w:strike/>')
  if (r.color) props.push(`<w:color w:val="${r.color}"/>`)
  if (r.size) props.push(`<w:sz w:val="${Math.round(r.size * 2)}"/><w:szCs w:val="${Math.round(r.size * 2)}"/>`)
  if (r.u) props.push('<w:u w:val="single"/>')
  if (r.va) props.push(`<w:vertAlign w:val="${r.va}"/>`)
  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : ''
  return `<w:r>${rPr}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`
}

// Symbol-font bullets use Private Use Area code points that show as boxes in other fonts.
const isPrivateUse = (ch) => ch.charCodeAt(0) >= 0xe000 && ch.charCodeAt(0) <= 0xf8ff

const roman = (n) => {
  const map = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]
  let out = ''
  for (const [v, s] of map) {
    while (n >= v) {
      out += s
      n -= v
    }
  }
  return out
}
function formatNumber(n, fmt) {
  if (fmt === 'a') return String.fromCharCode(96 + (((n - 1) % 26) + 1))
  if (fmt === 'A') return String.fromCharCode(64 + (((n - 1) % 26) + 1))
  if (fmt === 'i') return roman(n)
  if (fmt === 'I') return roman(n).toUpperCase()
  return String(n)
}

export async function odtToDocx(file, setStatus) {
  const { default: JSZip } = await import('jszip')
  let zip
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer())
  } catch {
    throw userError('This is not a valid ODT file.')
  }
  const contentXml = await zip.file('content.xml')?.async('string')
  if (!contentXml) throw userError('This is not a valid ODT file (content.xml is missing).')
  const stylesXml = (await zip.file('styles.xml')?.async('string')) || '<x/>'
  const parse = (xml) => new DOMParser().parseFromString(xml, 'application/xml')
  const content = parse(contentXml)
  const stylesDoc = parse(stylesXml)
  const ctx = { ...readStyles([stylesDoc, content]), cache: {} }
  const media = createMedia()
  let skippedImages = 0

  // Defaults (document font and size) and page setup.
  const defRun = {}
  readTextProps(ctx, childEl(ctx.defaults.paragraph, 'style', 'text-properties'), defRun)
  const standard = resolveStyle(ctx, 'paragraph', 'Standard').run
  const docFont = standard.font || defRun.font || 'Liberation Serif'
  const docSize = standard.size || defRun.size || 12
  const pl = ctx.pageLayout
  const page = {
    w: toPt(attr(pl, 'fo', 'page-width')) || 595.3,
    h: toPt(attr(pl, 'fo', 'page-height')) || 841.9,
    top: toPt(attr(pl, 'fo', 'margin-top')) ?? 56.7,
    right: toPt(attr(pl, 'fo', 'margin-right')) ?? 56.7,
    bottom: toPt(attr(pl, 'fo', 'margin-bottom')) ?? 56.7,
    left: toPt(attr(pl, 'fo', 'margin-left')) ?? 56.7,
  }
  const textWidth = page.w - page.left - page.right

  // Inline content of a paragraph → runs.
  const inline = async (node, run) => {
    let out = ''
    for (const n of kids(node)) {
      if (n.nodeType === 3) {
        const text = n.nodeValue.replace(/[\t\n\r ]+/g, ' ')
        if (text) out += runXml(text, run)
      } else if (is(n, 'text', 'span') || is(n, 'text', 'a')) {
        const style = attr(n, 'text', 'style-name')
        const r = { ...run, ...(style ? resolveStyle(ctx, 'text', style).run : {}) }
        if (is(n, 'text', 'a')) Object.assign(r, { u: true, color: r.color || '0563C1' })
        out += await inline(n, r)
      } else if (is(n, 'text', 's')) {
        out += runXml(' '.repeat(Number(attr(n, 'text', 'c')) || 1), run)
      } else if (is(n, 'text', 'tab')) {
        out += '<w:r><w:tab/></w:r>'
      } else if (is(n, 'text', 'line-break')) {
        out += '<w:r><w:br/></w:r>'
      } else if (is(n, 'draw', 'frame')) {
        const img = childEl(n, 'draw', 'image')
        const href = attr(img, 'xlink', 'href')
        const ext = (href || '').split('.').pop().toLowerCase()
        const data = href && ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext) ? await zip.file(href.replace(/^\.\//, ''))?.async('uint8array') : null
        if (!data) {
          if (img) skippedImages++
          continue
        }
        let w = toPt(attr(n, 'svg', 'width')) || 200
        let h = toPt(attr(n, 'svg', 'height')) || 150
        if (w > textWidth) [w, h] = [textWidth, (h * textWidth) / w]
        const { rid, n: id } = media.add(data, ext === 'jpg' ? 'jpeg' : ext)
        out += imageRun(rid, id, w, h)
      } else if (n.nodeType === 1 && !['note', 'annotation', 'bookmark', 'bookmark-start', 'bookmark-end', 'soft-page-break', 'sequence-decls'].includes(n.localName)) {
        out += await inline(n, run)
      }
    }
    return out
  }

  const paragraph = async (node, { prefix = '', listIndent = null } = {}) => {
    const name = attr(node, 'text', 'style-name') || 'Standard'
    const style = resolveStyle(ctx, 'paragraph', name)
    const outline = is(node, 'text', 'h') ? Number(attr(node, 'text', 'outline-level')) || 1 : style.heading
    const p = style.para
    const props = []
    if (outline && outline <= 6) props.push(`<w:pStyle w:val="Heading${outline}"/>`)
    if (p.pageBreak) props.push('<w:pageBreakBefore/>')
    const spacing = []
    if (p.before) spacing.push(`w:before="${twips(p.before)}"`)
    if (p.after) spacing.push(`w:after="${twips(p.after)}"`)
    if (p.line) spacing.push(`w:line="${Math.round(240 * p.line)}" w:lineRule="auto"`)
    if (spacing.length) props.push(`<w:spacing ${spacing.join(' ')}/>`)
    const left = listIndent ?? p.left ?? 0
    const first = listIndent !== null ? -18 : p.first ?? 0
    if (left || first) {
      const firstAttr = first > 0 ? ` w:firstLine="${twips(first)}"` : first < 0 ? ` w:hanging="${twips(-first)}"` : ''
      props.push(`<w:ind w:left="${twips(left)}"${firstAttr}/>`)
    }
    if (p.align) props.push(`<w:jc w:val="${p.align}"/>`)
    const run = style.run
    const lead = prefix ? runXml(prefix, run) + '<w:r><w:tab/></w:r>' : ''
    return `<w:p>${props.length ? `<w:pPr>${props.join('')}</w:pPr>` : ''}${lead}${await inline(node, run)}</w:p>`
  }

  const listLevel = (styleName, level) => {
    const list = ctx.listStyles[styleName]
    const levels = list ? kids(list).filter((n) => n.nodeType === 1) : []
    const lvl = levels.find((n) => Number(attr(n, 'text', 'level')) === level + 1) || levels[0]
    if (lvl && lvl.localName === 'list-level-style-number') {
      return { num: attr(lvl, 'style', 'num-format') || '1', prefix: attr(lvl, 'style', 'num-prefix') || '', suffix: attr(lvl, 'style', 'num-suffix') ?? '.', start: Number(attr(lvl, 'text', 'start-value')) || 1 }
    }
    return { bullet: (lvl && attr(lvl, 'text', 'bullet-char')) || '•' }
  }

  const list = async (node, level, inherited) => {
    const styleName = attr(node, 'text', 'style-name') || inherited
    const fmt = listLevel(styleName, level)
    let counter = fmt.start || 1
    let out = ''
    for (const item of kids(node).filter((n) => is(n, 'text', 'list-item') || is(n, 'text', 'list-header'))) {
      let first = is(item, 'text', 'list-item')
      for (const child of kids(item)) {
        if (is(child, 'text', 'list')) out += await list(child, level + 1, styleName)
        else if (is(child, 'text', 'p') || is(child, 'text', 'h')) {
          const prefix = first ? (fmt.bullet ? (isPrivateUse(fmt.bullet) ? '•' : fmt.bullet) : `${fmt.prefix}${formatNumber(counter, fmt.num)}${fmt.suffix}`) : ''
          out += await paragraph(child, { prefix, listIndent: 18 * (level + 1) + (first ? 0 : 0) })
          first = false
        } else out += await block(child, level)
      }
      if (is(item, 'text', 'list-item')) counter++
    }
    return out
  }

  const table = async (node) => {
    const columns = []
    // Columns of this table only (they may sit inside column groups), not of tables nested in its cells.
    const columnNodes = []
    const collectColumns = (parent) => {
      for (const n of kids(parent)) {
        if (is(n, 'table', 'table-column')) columnNodes.push(n)
        else if (n.nodeType === 1 && n.namespaceURI === NS.table && /columns|column-group/.test(n.localName)) collectColumns(n)
      }
    }
    collectColumns(node)
    for (const col of columnNodes) {
      const style = ctx.styles[`table-column:${attr(col, 'table', 'style-name')}`]
      const width = toPt(attr(childEl(style, 'style', 'table-column-properties'), 'style', 'column-width'))
      const repeat = Math.min(Number(attr(col, 'table', 'number-columns-repeated')) || 1, 64)
      for (let i = 0; i < repeat; i++) columns.push(width)
    }
    const known = columns.filter(Boolean).reduce((a, b) => a + b, 0)
    const scale = known > textWidth ? textWidth / known : 1
    const widths = columns.map((w) => (w ? w * scale : textWidth / columns.length))
    const rows = []
    const collectRows = (parent, header) => {
      for (const n of kids(parent)) {
        if (is(n, 'table', 'table-row')) rows.push({ node: n, header })
        else if (is(n, 'table', 'table-header-rows')) collectRows(n, true)
        else if (is(n, 'table', 'table-rows') || is(n, 'table', 'table-row-group')) collectRows(n, header)
      }
    }
    collectRows(node, false)
    const vspan = [] // remaining vertical-merge rows per column
    let out = `<w:tbl><w:tblPr><w:tblW w:w="${twips(widths.reduce((a, b) => a + b, 0))}" w:type="dxa"/><w:tblBorders>` +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="auto"/>`).join('') +
      `</w:tblBorders></w:tblPr><w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${twips(w)}"/>`).join('')}</w:tblGrid>`
    for (const { node: row, header } of rows) {
      out += `<w:tr>${header ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}`
      let col = 0
      for (const cell of kids(row).filter((n) => is(n, 'table', 'table-cell') || is(n, 'table', 'covered-table-cell'))) {
        const span = Number(attr(cell, 'table', 'number-columns-spanned')) || 1
        const repeat = Math.min(Number(attr(cell, 'table', 'number-columns-repeated')) || 1, 64)
        for (let r = 0; r < repeat; r++) {
          if (is(cell, 'table', 'covered-table-cell')) {
            if (vspan[col]?.left > 0) {
              const { span: s } = vspan[col]
              vspan[col].left--
              out += `<w:tc><w:tcPr><w:tcW w:w="${twips(widths.slice(col, col + s).reduce((a, b) => a + b, 0))}" w:type="dxa"/>${s > 1 ? `<w:gridSpan w:val="${s}"/>` : ''}<w:vMerge/></w:tcPr><w:p/></w:tc>`
              col += s
            } else col++
            continue
          }
          const rows2 = Number(attr(cell, 'table', 'number-rows-spanned')) || 1
          if (rows2 > 1) vspan[col] = { left: rows2 - 1, span }
          const w = widths.slice(col, col + span).reduce((a, b) => a + b, 0) || textWidth / Math.max(1, columns.length)
          let inner = ''
          for (const child of kids(cell)) inner += await block(child, 0)
          out += `<w:tc><w:tcPr><w:tcW w:w="${twips(w)}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ''}${rows2 > 1 ? '<w:vMerge w:val="restart"/>' : ''}</w:tcPr>${inner || '<w:p/>'}</w:tc>`
          col += span
        }
      }
      out += '</w:tr>'
    }
    // Word needs a paragraph between a table and whatever follows it.
    return `${out}</w:tbl><w:p/>`
  }

  const block = async (node, level = 0) => {
    if (node.nodeType !== 1) return ''
    if (is(node, 'text', 'p') || is(node, 'text', 'h')) return paragraph(node)
    if (is(node, 'text', 'list')) return list(node, level, null)
    if (is(node, 'table', 'table')) return table(node)
    if (['section', 'index-body', 'table-of-content', 'alphabetical-index', 'illustration-index', 'bibliography', 'user-index', 'object-index', 'table-index'].includes(node.localName)) {
      let out = ''
      for (const child of kids(node)) out += await block(child, level)
      return out
    }
    return ''
  }

  setStatus('Converting content…')
  const textNode = content.getElementsByTagNameNS(NS.office, 'text')[0]
  if (!textNode) throw userError('This ODT file has no text content.')
  let body = ''
  for (const child of kids(textNode)) body += await block(child)
  if (!body) throw userError('This ODT file has no text content.')

  setStatus('Saving Word file…')
  const blob = await writeDocx({ body, media, page, defaults: { font: docFont, size: docSize } })
  return { blob, images: media.items.length, skippedImages }
}

export default {
  accept: '.odt,application/vnd.oasis.opendocument.text',
  drop: 'Drop an ODT file here or click to browse',
  hint: 'OpenDocument Text (.odt) from LibreOffice, OpenOffice or Google Docs · nothing is uploaded',
  wrongFile: 'Please choose an OpenDocument text file (.odt).',
  action: 'Convert to DOCX',
  downloadLabel: 'Download Word file',
  empty: 'Your Word file details will appear here.',
  errorMessage: 'This ODT file could not be converted. Make sure it opens in LibreOffice.',
  async convert({ files, setStatus }) {
    setStatus('Reading ODT…')
    const { blob, images, skippedImages } = await odtToDocx(files[0], setStatus)
    return {
      downloads: [{ name: `${baseName(files[0])}.docx`, blob }],
      summary: `Word file ready · ${formatBytes(blob.size)}${images ? ` · ${images} image${images > 1 ? 's' : ''}` : ''}`,
      notes: skippedImages ? [`${skippedImages} image${skippedImages > 1 ? 's' : ''} in a vector format (SVG/WMF/EMF) could not be carried over.`] : [],
    }
  },
}
