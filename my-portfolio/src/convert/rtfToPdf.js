import { el } from '../htmlPages'
import { baseName, blocksToPdf, pageSettings, pdfOptions, readText, userError } from './common'
import { rtfToHtml } from './rtf'

export default {
  accept: '.rtf,application/rtf,text/rtf',
  drop: 'Drop an RTF file here or click to browse',
  hint: 'Rich Text Format (.rtf) from WordPad, TextEdit, Word and more',
  wrongFile: 'Please choose an RTF file (.rtf).',
  action: 'Convert to PDF',
  downloadLabel: 'Download PDF',
  empty: 'Your PDF pages will appear here.',
  errorMessage: 'This RTF file could not be read. Make sure it opens in WordPad or Word.',
  options: [pdfOptions.page, pdfOptions.orientation, pdfOptions.margin, pdfOptions.quality],
  async convert({ files, options, setStatus, isStale }) {
    setStatus('Reading RTF…')
    const rtf = await readText(files[0])
    let parsed
    try {
      parsed = rtfToHtml(rtf.trimStart())
    } catch {
      throw userError('This is not a valid RTF file.')
    }
    if (!parsed.length) throw userError('This RTF file has no text.')
    const blocks = parsed.map(({ html, breakBefore }) => {
      const block = el(html)
      if (breakBefore) block.dataset.break = 'before'
      return block
    })
    const css = `#STAGE .hp-content { font: 12pt/1.2 'Times New Roman', Times, serif; white-space: pre-wrap }
      #STAGE .hp-content p { overflow-wrap: anywhere }
      #STAGE .rtf-table { border-collapse: collapse; margin: 4pt 0 }
      #STAGE .rtf-table td { border: 1px solid #888; padding: 2pt 5pt; vertical-align: top }`
    return blocksToPdf(blocks, { settings: pageSettings(options), options, name: baseName(files[0]), css, setStatus, isStale })
  },
}
