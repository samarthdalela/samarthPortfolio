import { baseName, loadXlsx, readText, userError } from './common'

const delimiters = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' }
const euroNumber = /^-?(\d{1,3}(\.\d{3})+|\d+),\d+$/

// Turns CSV text values into Excel numbers and dates. SheetJS's own guessing is not used: it reads "1250,50" as
// 125050 and drops leading zeros from phone numbers. Rules:
// - leading zeros ("0987…") and more than 15 digits stay text (phone numbers, IDs, account numbers)
// - in comma-separated files "1,234.5" is a number; in semicolon/tab files "1.234,5" is
// - "12%" / "12,5%" become percentages; ISO dates ("2026-01-15", optional time) become dates
const usNumber = /^-?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/
const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)

function typeCell(cell, commaDecimal) {
  const t = String(cell.v).trim()
  if (!t || /^[-+]?0\d/.test(t) || t.replace(/\D/g, '').length > 15) return
  const percent = t.endsWith('%')
  const body = percent ? t.slice(0, -1).trim() : t
  let n = null
  if (commaDecimal && euroNumber.test(body)) n = parseFloat(body.replace(/\./g, '').replace(',', '.'))
  else if (/^-?\d+(\.\d+)?$/.test(body) || (!commaDecimal && usNumber.test(body))) n = parseFloat(body.replace(/,/g, ''))
  if (n !== null && Number.isFinite(n)) {
    Object.assign(cell, percent ? { t: 'n', v: n / 100, z: '0.##%' } : { t: 'n', v: n })
    delete cell.w
    return
  }
  const d = isoDate.exec(t)
  if (d) {
    const ms = Date.UTC(+d[1], +d[2] - 1, +d[3], +(d[4] || 0), +(d[5] || 0), +(d[6] || 0))
    if (!Number.isNaN(ms)) {
      Object.assign(cell, { t: 'n', v: (ms - EXCEL_EPOCH) / 86400000, z: d[4] ? 'yyyy-mm-dd hh:mm' : 'yyyy-mm-dd' })
      delete cell.w
    }
  }
}

// Picks the separator that splits the first lines into the same (largest) number of columns.
export function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 20)
  let best = ','
  let bestScore = 0
  for (const d of [',', ';', '\t', '|']) {
    const counts = lines.map((line) => {
      let n = 0
      let quoted = false
      for (const ch of line) {
        if (ch === '"') quoted = !quoted
        else if (ch === d && !quoted) n++
      }
      return n
    })
    const min = Math.min(...counts)
    const consistent = counts.filter((c) => c === counts[0]).length / counts.length
    const score = min > 0 ? min * consistent : 0
    if (score > bestScore) {
      best = d
      bestScore = score
    }
  }
  return best
}

const formats = {
  xlsx: { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  xls: { ext: 'xls', mime: 'application/vnd.ms-excel', bookType: 'biff8' },
  ods: { ext: 'ods', mime: 'application/vnd.oasis.opendocument.spreadsheet' },
}

export default {
  accept: '.csv,.tsv,.txt,text/csv,text/tab-separated-values',
  multiple: true,
  drop: 'Drop CSV files here or click to browse',
  hint: 'CSV or TSV · add several files to get one sheet each · or paste CSV below',
  wrongFile: 'Please choose a CSV file (.csv).',
  textInput: { label: 'Or paste CSV data', placeholder: 'name,email,amount\nAsha,asha@example.com,1200' },
  action: 'Convert to Excel',
  downloadLabel: 'Download Excel file',
  empty: 'A preview of your data will appear here.',
  errorMessage: 'This CSV could not be converted.',
  options: [
    { key: 'delimiter', label: 'Separator', default: 'auto', choices: [['auto', 'Detect automatically'], ['comma', 'Comma ( , )'], ['semicolon', 'Semicolon ( ; )'], ['tab', 'Tab'], ['pipe', 'Pipe ( | )']] },
    { key: 'types', label: 'Values', default: 'auto', choices: [['auto', 'Detect numbers & dates'], ['text', 'Keep everything as text']] },
    { key: 'format', label: 'Save as', default: 'xlsx', choices: [['xlsx', 'Excel (.xlsx)'], ['xls', 'Excel 97–2003 (.xls)'], ['ods', 'OpenDocument (.ods)']] },
  ],
  async convert({ files, text, options, setStatus }) {
    setStatus('Reading CSV…')
    const XLSX = await loadXlsx()
    const inputs = files.length ? await Promise.all(files.map(async (f) => ({ name: baseName(f), text: await readText(f) }))) : [{ name: 'Sheet1', text }]
    const wb = XLSX.utils.book_new()
    const used = new Set()
    let preview = null
    let totalRows = 0

    for (const input of inputs) {
      if (!input.text.trim()) continue
      const FS = options.delimiter === 'auto' ? detectDelimiter(input.text) : delimiters[options.delimiter]
      const parsed = XLSX.read(input.text, { type: 'string', FS, raw: true, dense: true })
      const ws = parsed.Sheets[parsed.SheetNames[0]]
      if (options.types !== 'text') {
        for (const row of ws['!data'] || []) for (const cell of row || []) if (cell?.t === 's') typeCell(cell, FS !== ',')
      }
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', blankrows: false })
      totalRows += rows.length
      // Column widths from the longest value in each column (Excel shows ~1 character per unit).
      const widths = []
      for (const row of rows) row.forEach((v, c) => (widths[c] = Math.max(widths[c] || 6, Math.min(60, String(v).length + 2))))
      ws['!cols'] = widths.map((wch) => ({ wch }))
      // Sheet names: max 31 characters, no []:*?/\ and unique.
      let sheet = input.name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31).trim() || 'Sheet'
      for (let n = 2; used.has(sheet.toLowerCase()); n++) sheet = `${sheet.slice(0, 28)} (${n})`
      used.add(sheet.toLowerCase())
      XLSX.utils.book_append_sheet(wb, ws, sheet)
      preview ??= rows.slice(0, 12)
    }
    if (!wb.SheetNames.length) throw userError('The CSV is empty.')

    const fmt = formats[options.format] || formats.xlsx
    const data = XLSX.write(wb, { bookType: fmt.bookType || fmt.ext, type: 'array', compression: true })
    const blob = new Blob([data], { type: fmt.mime })
    const name = `${files.length === 1 ? baseName(files[0]) : files.length ? 'combined' : 'data'}.${fmt.ext}`
    return {
      downloads: [{ name, blob }],
      summary: `${wb.SheetNames.length} sheet${wb.SheetNames.length > 1 ? 's' : ''} · ${totalRows} rows · ${name}`,
      table: preview.map((row) => row.slice(0, 12).map((c) => String(c).slice(0, 40))),
    }
  },
}
