import { el, escapeHtml } from '../htmlPages'
import { baseName, blocksToPdf, pageSettings, pdfOptions, readText, userError } from './common'

const fonts = {
  sans: "Calibri, Carlito, 'Segoe UI', Arial, sans-serif",
  serif: "'Times New Roman', Times, Georgia, serif",
  mono: "Consolas, 'Courier New', Menlo, monospace",
}

export default {
  accept: '.txt,.text,.log,.md,.csv,.json,.xml,.ini,.cfg,.conf,.yaml,.yml,text/plain',
  drop: 'Drop a text file here or click to browse',
  hint: 'TXT, LOG, MD, JSON, CSV and other plain-text files · or paste text below',
  wrongFile: 'Please choose a plain-text file (.txt).',
  textInput: { label: 'Or paste text', placeholder: 'Paste or type the text to turn into a PDF…' },
  action: 'Convert to PDF',
  downloadLabel: 'Download PDF',
  empty: 'Your PDF pages will appear here.',
  options: [
    { key: 'font', label: 'Font', default: 'sans', choices: [['sans', 'Sans-serif (Calibri)'], ['serif', 'Serif (Times)'], ['mono', 'Monospace (code)']] },
    { key: 'size', label: 'Font size', default: '11', choices: [['9', '9 pt'], ['10', '10 pt'], ['11', '11 pt'], ['12', '12 pt'], ['14', '14 pt']] },
    pdfOptions.page,
    pdfOptions.orientation,
    pdfOptions.margin,
    pdfOptions.quality,
  ],
  async convert({ files, text, options, setStatus, isStale }) {
    setStatus('Reading text…')
    const content = files[0] ? await readText(files[0]) : text
    if (!content.trim()) throw userError('The text is empty.')
    // One block per line keeps blank lines and lets pages break between lines.
    const blocks = content
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => el(`<p class="t">${line ? escapeHtml(line) : '&nbsp;'}</p>`))
    const css = `#STAGE .t { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; tab-size: 4;
      font: ${Number(options.size)}pt/1.35 ${fonts[options.font] || fonts.sans} }`
    return blocksToPdf(blocks, {
      settings: pageSettings(options),
      options,
      name: baseName(files[0], 'text'),
      css,
      setStatus,
      isStale,
    })
  },
}
