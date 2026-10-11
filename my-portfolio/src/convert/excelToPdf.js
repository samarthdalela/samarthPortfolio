import { createStage } from '../pageCapture'
import { el, escapeHtml } from '../htmlPages'
import { baseName, blocksToPdf, loadXlsx, pageSettings, pdfOptions, userError } from './common'

export const spreadsheetAccept = '.xlsx,.xlsm,.xlsb,.xls,.ods,.csv,.tsv,.numbers'

const tableCss = (grid) => `
#STAGE .xl { border-collapse: collapse; font-family: Calibri, Carlito, 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.25 }
#STAGE .xl td { ${grid ? 'border: 1px solid #c8c8c8;' : ''} padding: 0.15em 0.45em; white-space: nowrap; vertical-align: bottom }
#STAGE .xl td[data-t="n"], #STAGE .xl td[data-t="d"] { text-align: right }
#STAGE .xl td.wrap { white-space: normal; min-width: 16em; max-width: 26em }
#STAGE .sheet-name { font: bold 12pt Calibri, Carlito, Arial, sans-serif; margin: 0 0 6pt }`

export default {
  accept: spreadsheetAccept,
  drop: 'Drop an Excel file here or click to browse',
  hint: 'XLSX, XLS, ODS, CSV · every sheet is converted · nothing is uploaded',
  wrongFile: 'Please choose an Excel or spreadsheet file (.xlsx, .xls, .ods or .csv).',
  icon: 'file',
  action: 'Convert to PDF',
  downloadLabel: 'Download PDF',
  empty: 'Your PDF pages will appear here.',
  errorMessage: 'This spreadsheet could not be read. Make sure it opens in Excel.',
  options: [
    { key: 'sheets', label: 'Sheets', default: 'all', choices: [['all', 'All sheets'], ['first', 'First sheet only']] },
    { key: 'orientation', label: 'Orientation', default: 'auto', choices: [['auto', 'Auto (landscape for wide sheets)'], ['portrait', 'Portrait'], ['landscape', 'Landscape']] },
    { key: 'grid', label: 'Gridlines', default: 'yes', choices: [['yes', 'Show gridlines'], ['no', 'No gridlines']] },
    pdfOptions.page,
    { ...pdfOptions.margin, default: '36' },
    pdfOptions.quality,
  ],
  async convert({ files, options, setStatus, isStale }) {
    setStatus('Reading spreadsheet…')
    const XLSX = await loadXlsx()
    const wb = XLSX.read(await files[0].arrayBuffer(), { type: 'array', cellDates: true })
    const names = options.sheets === 'first' ? wb.SheetNames.slice(0, 1) : wb.SheetNames
    const css = tableCss(options.grid === 'yes')

    // Build one table per non-empty sheet.
    const sheets = []
    for (const name of names) {
      const ws = wb.Sheets[name]
      if (!ws?.['!ref']) continue
      const table = el(XLSX.utils.sheet_to_html(ws, { header: '', footer: '' }).match(/<table[\s\S]*<\/table>/i)?.[0] || '')
      if (!table || !table.querySelector('td')) continue
      table.className = 'xl'
      table.removeAttribute('id')
      table.dataset.repeatHeader = ''
      for (const td of table.querySelectorAll('td')) if (td.textContent.length > 50) td.classList.add('wrap')
      sheets.push({ name, table })
    }
    if (!sheets.length) throw userError('This spreadsheet has no data to convert.')

    // Measure natural widths to pick the orientation and shrink wide sheets to fit the page width.
    const measure = createStage(css)
    const widthOf = (table) => {
      measure.body.append(table)
      const w = table.getBoundingClientRect().width
      table.remove()
      return w
    }
    const portrait = pageSettings({ ...options, orientation: 'portrait' })
    const widths = sheets.map((s) => widthOf(s.table))
    const landscape =
      options.orientation === 'landscape' ||
      (options.orientation === 'auto' && widths.some((w) => w > portrait.pageW - portrait.margin * 2))
    const settings = pageSettings(options, landscape)
    const contentW = settings.pageW - settings.margin * 2
    sheets.forEach((s, i) => {
      let size = 10
      let width = widths[i]
      for (let tries = 0; tries < 3 && width > contentW; tries++) {
        size = Math.max(2, (size * contentW) / width - 0.05)
        s.table.style.fontSize = `${size}pt`
        width = widthOf(s.table)
      }
    })
    measure.remove()

    const blocks = []
    sheets.forEach((s, i) => {
      if (sheets.length > 1) {
        const heading = el(`<h3 class="sheet-name">${escapeHtml(s.name)}</h3>`)
        if (i > 0) heading.dataset.break = 'before'
        blocks.push(heading)
      }
      blocks.push(s.table)
    })
    return blocksToPdf(blocks, { settings, options, name: baseName(files[0]), css, setStatus, isStale })
  },
}
