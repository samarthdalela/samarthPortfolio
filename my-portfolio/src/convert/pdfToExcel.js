import { baseName, loadXlsx, userError } from './common'
import { openPdf, readPage, tableRows } from './pdfText'

// "1,234.50", "1,23,456", "-12", "(45.00)", "₹1,200", "12.5%" → numbers. IDs with leading zeros and
// very long digit strings (account numbers) stay text.
const numberRe = /^(\()?([-+])?\s?[$€£₹¥]?\s?(\d{1,3}(?:,\d{2,3})+|\d+)(\.\d+)?(\))?\s?(%)?$/
function toCell(text, detect) {
  const t = text.trim()
  if (!detect || !t || /^0\d/.test(t) || t.replace(/\D/g, '').length > 15) return t
  const m = numberRe.exec(t)
  if (!m) return t
  let v = parseFloat(m[3].replace(/,/g, '') + (m[4] || ''))
  if (m[2] === '-' || (m[1] && m[5])) v = -v
  return m[6] ? { percent: v / 100 } : v
}

export default {
  accept: '.pdf,application/pdf',
  drop: 'Drop a PDF here or click to browse',
  hint: 'PDFs with tables — bank statements, invoices, price lists, reports · nothing is uploaded',
  wrongFile: 'Please choose a PDF file.',
  action: 'Convert to Excel',
  downloadLabel: 'Download Excel file',
  empty: 'A preview of the extracted table will appear here.',
  errorMessage: 'This PDF could not be converted.',
  options: [
    { key: 'layout', label: 'Sheets', default: 'one', choices: [['one', 'All pages in one sheet'], ['pages', 'One sheet per page']] },
    { key: 'numbers', label: 'Numbers', default: 'auto', choices: [['auto', 'Convert to real numbers'], ['text', 'Keep as text']] },
  ],
  async convert({ files, options, password, setStatus, isStale }) {
    setStatus('Opening PDF…')
    const { pdfjs, pdf } = await openPdf(files[0], password)
    const XLSX = await loadXlsx()
    const detect = options.numbers === 'auto'
    const pages = []
    let scanned = 0
    for (let n = 1; n <= pdf.numPages; n++) {
      setStatus(`Reading page ${n} of ${pdf.numPages}…`)
      const { items, chars } = await readPage(pdfjs, await pdf.getPage(n))
      if (isStale()) return null
      if (chars < 10) scanned++
      pages.push(tableRows(items).map((row) => row.map((c) => toCell(c, detect))))
    }
    pdf.destroy()
    if (pages.every((p) => !p.length)) throw userError('No text was found in this PDF. It may be a scan — text recognition (OCR) is not supported.')

    const makeSheet = (rows) => {
      const ws = XLSX.utils.aoa_to_sheet(rows.map((r) => r.map((c) => (typeof c === 'object' ? c.percent : c))))
      rows.forEach((r, ri) =>
        r.forEach((c, ci) => {
          if (typeof c === 'object') ws[XLSX.utils.encode_cell({ r: ri, c: ci })].z = '0.00%'
        }),
      )
      const widths = []
      for (const r of rows) r.forEach((c, i) => (widths[i] = Math.max(widths[i] || 8, Math.min(60, String(typeof c === 'object' ? c.percent : c).length + 2))))
      ws['!cols'] = widths.map((wch) => ({ wch }))
      return ws
    }

    const wb = XLSX.utils.book_new()
    if (options.layout === 'pages') {
      pages.forEach((rows, i) => rows.length && XLSX.utils.book_append_sheet(wb, makeSheet(rows), `Page ${i + 1}`))
    } else {
      const all = pages.flatMap((rows, i) => (i > 0 && rows.length ? [[], ...rows] : rows))
      XLSX.utils.book_append_sheet(wb, makeSheet(all), 'Sheet1')
    }
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const rows = pages.reduce((n, p) => n + p.length, 0)
    const first = pages.find((p) => p.length) || []
    return {
      downloads: [{ name: `${baseName(files[0])}.xlsx`, blob }],
      summary: `${rows} rows from ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''} · ${wb.SheetNames.length} sheet${wb.SheetNames.length > 1 ? 's' : ''}`,
      notes: scanned ? [`${scanned} page${scanned > 1 ? 's have' : ' has'} no selectable text (probably scanned) and could not be read.`] : [],
      table: first.slice(0, 15).map((r) => r.slice(0, 10).map((c) => String(typeof c === 'object' ? `${(c.percent * 100).toFixed(2)}%` : c).slice(0, 30))),
    }
  },
}
