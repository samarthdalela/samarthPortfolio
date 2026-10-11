// A small RTF reader: turns Rich Text Format into HTML paragraphs and tables.
// Handles fonts, sizes, bold/italic/underline/strike, colours, super/subscript, alignment, indents, spacing,
// page breaks, simple tables, PNG/JPEG pictures and Unicode/code-page characters. Unknown groups are skipped.

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Groups whose content is not document text.
const skipDestinations = new Set([
  'fonttbl', 'colortbl', 'stylesheet', 'info', 'header', 'headerl', 'headerr', 'headerf', 'footer', 'footerl',
  'footerr', 'footerf', 'footnote', 'annotation', 'fldinst', 'xmlnstbl', 'listtable', 'listoverridetable',
  'rsidtbl', 'generator', 'themedata', 'colorschememapping', 'latentstyles', 'datastore', 'mmathPr', 'pgdsctbl',
  'filetbl', 'revtbl', 'pntxta', 'pntxtb', 'pn', 'object', 'nonshppict', 'bkmkstart', 'bkmkend', 'template',
])

const twipsToPt = (n) => n / 20

function decoderFor(cp) {
  try {
    return new TextDecoder(cp === 65001 ? 'utf-8' : `windows-${cp}`)
  } catch {
    return new TextDecoder('windows-1252')
  }
}

export function rtfToHtml(rtf) {
  if (!rtf.startsWith('{\\rtf')) throw new Error('not rtf')
  const fonts = {}
  const colors = []
  let decoder = decoderFor(1252)
  let defaultFont = null

  const blocks = [] // finished HTML blocks
  let para = [] // HTML pieces of the current paragraph
  let tableRows = [] // rows of the current table, each an array of cell HTML
  let rowCells = []
  let cellParas = []
  let breakBefore = false

  const baseChar = () => ({ b: false, i: false, u: false, s: false, fs: 24, f: defaultFont, cf: 0, va: '' })
  const basePara = () => ({ align: '', li: 0, fi: 0, sb: 0, sa: 0, intbl: false })
  let state = { char: baseChar(), para: basePara(), skip: false, dest: '', uc: 1 }
  const stack = []
  let pendingBytes = []
  let skipChars = 0
  let picture = null
  let fontName = ''
  let fontId = null
  let color = null

  const flushBytes = () => {
    if (!pendingBytes.length) return
    const text = decoder.decode(new Uint8Array(pendingBytes))
    pendingBytes = []
    addText(text)
  }

  const runStyle = (c) => {
    const css = []
    if (c.b) css.push('font-weight:bold')
    if (c.i) css.push('font-style:italic')
    const deco = [c.u && 'underline', c.s && 'line-through'].filter(Boolean).join(' ')
    if (deco) css.push(`text-decoration:${deco}`)
    if (c.fs !== 24) css.push(`font-size:${c.fs / 2}pt`)
    if (c.f !== null && fonts[c.f] && !/symbol|wingdings/i.test(fonts[c.f])) css.push(`font-family:'${fonts[c.f].replace(/'/g, '')}'`)
    if (c.cf && colors[c.cf]) css.push(`color:${colors[c.cf]}`)
    if (c.va) css.push(`vertical-align:${c.va};font-size:smaller`)
    return css.join(';')
  }

  function addText(text) {
    if (state.skip) return
    if (state.dest === 'fonttbl') {
      fontName += text
      return
    }
    if (state.dest === 'colortbl') {
      // ';' ends each colour entry; an entry without values is the "auto" colour.
      for (const ch of text) {
        if (ch === ';') {
          colors.push(color ? `rgb(${color.r},${color.g},${color.b})` : '')
          color = null
        }
      }
      return
    }
    if (!text) return
    // Bullets typed in the Symbol/Wingdings fonts use those fonts' own codes; show a normal bullet instead.
    const font = fonts[state.char.f] || ''
    if (/symbol|wingdings/i.test(font)) text = text.replace(/[·§]/g, '•')
    const style = runStyle(state.char)
    const html = escapeHtml(text)
    para.push(style ? `<span style="${style}">${html}</span>` : html)
  }

  const paraStyle = (p) => {
    const css = []
    if (p.align) css.push(`text-align:${p.align}`)
    if (p.li) css.push(`margin-left:${twipsToPt(p.li)}pt`)
    if (p.fi) css.push(`text-indent:${twipsToPt(p.fi)}pt`)
    css.push(`margin-top:${twipsToPt(p.sb)}pt`, `margin-bottom:${twipsToPt(p.sa)}pt`)
    return css.join(';')
  }

  const endParagraph = () => {
    flushBytes()
    const html = `<p style="${paraStyle(state.para)}">${para.join('') || '&nbsp;'}</p>`
    para = []
    if (state.para.intbl) {
      cellParas.push(html)
      return
    }
    flushTable()
    blocks.push({ html, breakBefore })
    breakBefore = false
  }

  const flushTable = () => {
    if (!tableRows.length) return
    const rows = tableRows.map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
    blocks.push({ html: `<table class="rtf-table"><tbody>${rows}</tbody></table>`, breakBefore })
    breakBefore = false
    tableRows = []
  }

  const endCell = () => {
    flushBytes()
    if (para.length) cellParas.push(`<p style="${paraStyle(state.para)}">${para.join('')}</p>`)
    para = []
    rowCells.push(cellParas.join('') || '&nbsp;')
    cellParas = []
  }

  const control = (word, param) => {
    const has = param !== null
    const c = state.char
    const p = state.para
    switch (word) {
      // Document
      case 'ansicpg': decoder = decoderFor(param); break
      case 'deff': defaultFont = param; c.f = param; break
      case 'uc': state.uc = param; break
      case 'u': {
        flushBytes()
        addText(String.fromCharCode(param < 0 ? param + 65536 : param))
        skipChars = state.uc
        break
      }
      // Font and colour tables
      case 'f':
        if (state.dest === 'fonttbl') {
          // Fonts may be listed without their own groups ({\fonttbl\f0 Arial;\f1 Times;}).
          if (fontId !== null && fontName.trim()) fonts[fontId] = fontName.replace(/;.*$/s, '').trim()
          fontId = param
          fontName = ''
        } else c.f = param
        break
      case 'red': color = { ...(color || { r: 0, g: 0, b: 0 }), r: param }; break
      case 'green': color = { ...(color || { r: 0, g: 0, b: 0 }), g: param }; break
      case 'blue': color = { ...(color || { r: 0, g: 0, b: 0 }), b: param }; break
      // Character formatting
      case 'plain': state.char = { ...baseChar(), f: defaultFont }; break
      case 'b': c.b = !has || param !== 0; break
      case 'i': c.i = !has || param !== 0; break
      case 'ul': c.u = !has || param !== 0; break
      case 'ulnone': c.u = false; break
      case 'strike': c.s = !has || param !== 0; break
      case 'fs': c.fs = param; break
      case 'cf': c.cf = param; break
      case 'super': c.va = 'super'; break
      case 'sub': c.va = 'sub'; break
      case 'nosupersub': c.va = ''; break
      // Paragraph formatting
      case 'pard': state.para = basePara(); break
      case 'ql': p.align = ''; break
      case 'qc': p.align = 'center'; break
      case 'qr': p.align = 'right'; break
      case 'qj': p.align = 'justify'; break
      case 'li': p.li = param; break
      case 'fi': p.fi = param; break
      case 'sb': p.sb = param; break
      case 'sa': p.sa = param; break
      case 'intbl': p.intbl = true; break
      // Breaks and special characters
      case 'par': endParagraph(); break
      case 'line': flushBytes(); para.push('<br>'); break
      case 'page': endParagraph(); breakBefore = true; break
      case 'tab': addText('\t'); break
      case 'emdash': addText('—'); break
      case 'endash': addText('–'); break
      case 'bullet': addText('•'); break
      case 'lquote': addText('‘'); break
      case 'rquote': addText('’'); break
      case 'ldblquote': addText('“'); break
      case 'rdblquote': addText('”'); break
      // Tables
      case 'trowd': rowCells = []; break
      case 'cell': endCell(); break
      case 'row': tableRows.push(rowCells); rowCells = []; break
      // Pictures
      case 'pict': picture = { hex: '', type: '', w: 0, h: 0 }; state.dest = 'pict'; break
      case 'pngblip': if (picture) picture.type = 'image/png'; break
      case 'jpegblip': if (picture) picture.type = 'image/jpeg'; break
      case 'picwgoal': if (picture) picture.w = param; break
      case 'pichgoal': if (picture) picture.h = param; break
      default:
        if (skipDestinations.has(word)) {
          if (word === 'fonttbl' || word === 'colortbl') state.dest = word
          else state.skip = true
        }
    }
  }

  let i = 0
  let starred = false
  while (i < rtf.length) {
    const ch = rtf[i]
    if (ch === '{') {
      flushBytes()
      stack.push(state)
      state = { ...state, char: { ...state.char }, para: state.para }
      i++
      continue
    }
    if (ch === '}') {
      flushBytes()
      if (state.dest === 'fonttbl' && fontId !== null && fontName) {
        fonts[fontId] = fontName.replace(/;.*$/s, '').trim()
        fontId = null
        fontName = ''
      }
      if (state.dest === 'pict' && picture && !stack.at(-1)?.skip && stack.at(-1)?.dest !== 'pict') {
        if (picture.type && picture.hex) {
          const bytes = picture.hex.match(/../g).map((h) => parseInt(h, 16))
          let bin = ''
          for (const b of bytes) bin += String.fromCharCode(b)
          const size = picture.w ? ` style="width:${twipsToPt(picture.w)}pt;height:${twipsToPt(picture.h)}pt"` : ''
          para.push(`<img src="data:${picture.type};base64,${btoa(bin)}"${size} alt="">`)
        }
        picture = null
      }
      const parentPara = stack.length ? stack.at(-1).para : state.para
      const keepPara = state.para
      state = stack.pop() || state
      // Paragraph properties persist across groups in RTF.
      state.para = keepPara === parentPara ? state.para : keepPara
      i++
      continue
    }
    if (ch === '\\') {
      const next = rtf[i + 1]
      if (next === "'") {
        const byte = parseInt(rtf.substr(i + 2, 2), 16)
        i += 4
        if (skipChars > 0) {
          skipChars--
          continue
        }
        if (!state.skip && state.dest !== 'pict') pendingBytes.push(byte)
        continue
      }
      if (next === '*') {
        starred = true
        i += 2
        continue
      }
      if (/[a-zA-Z]/.test(next)) {
        const m = /^\\([a-zA-Z]+)(-?\d+)? ?/.exec(rtf.slice(i, i + 40))
        i += m[0].length
        const word = m[1]
        const param = m[2] !== undefined ? Number(m[2]) : null
        if (starred) {
          starred = false
          // \*\word: an optional destination — skip it unless we understand it.
          if (!['shppict', 'pict'].includes(word)) {
            state.skip = true
            continue
          }
        }
        if (word !== 'u' && word !== "'") flushBytes()
        if (state.skip) continue
        control(word, param)
        continue
      }
      // Control symbols
      flushBytes()
      i += 2
      if (skipChars > 0) {
        skipChars--
        continue
      }
      if (next === '\\' || next === '{' || next === '}') addText(next)
      else if (next === '~') addText(' ')
      else if (next === '_') addText('‑')
      else if (next === '\n' || next === '\r') endParagraph()
      continue
    }
    if (ch === '\r' || ch === '\n') {
      i++
      continue
    }
    // Plain text run
    let j = i
    while (j < rtf.length && !'{}\\\r\n'.includes(rtf[j])) j++
    let text = rtf.slice(i, j)
    i = j
    if (state.dest === 'pict') {
      if (picture) picture.hex += text.replace(/[^0-9a-fA-F]/g, '')
      continue
    }
    if (skipChars > 0) {
      const n = Math.min(skipChars, text.length)
      text = text.slice(n)
      skipChars -= n
    }
    flushBytes()
    addText(text)
  }
  flushBytes()
  if (para.length) endParagraph()
  flushTable()
  return blocks
}
