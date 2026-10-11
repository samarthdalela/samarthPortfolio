import { baseName, loadXlsx, userError } from './common'
import { spreadsheetAccept } from './excelToPdf'

const delimiters = { comma: ',', semicolon: ';', tab: '\t' }

export default {
  accept: spreadsheetAccept.replace(',.csv,.tsv', ''),
  drop: 'Drop an Excel file here or click to browse',
  hint: 'XLSX, XLS, XLSB, ODS · each sheet becomes its own CSV · nothing is uploaded',
  wrongFile: 'Please choose an Excel file (.xlsx, .xls or .ods).',
  action: 'Convert to CSV',
  downloadLabel: 'Download CSV',
  empty: 'A preview of your data will appear here.',
  errorMessage: 'This spreadsheet could not be read. Make sure it opens in Excel.',
  options: [
    { key: 'delimiter', label: 'Separator', default: 'comma', choices: [['comma', 'Comma ( , )'], ['semicolon', 'Semicolon ( ; ) — European Excel'], ['tab', 'Tab (TSV)']] },
    { key: 'bom', label: 'Encoding', default: 'bom', choices: [['bom', 'UTF-8 for Excel (with BOM)'], ['plain', 'UTF-8 (no BOM)']] },
    { key: 'sheets', label: 'Sheets', default: 'all', choices: [['all', 'All sheets'], ['first', 'First sheet only']] },
    { key: 'values', label: 'Values', default: 'formatted', choices: [['formatted', 'As shown in Excel'], ['raw', 'Raw values']] },
  ],
  async convert({ files, options, setStatus }) {
    setStatus('Reading spreadsheet…')
    const XLSX = await loadXlsx()
    const wb = XLSX.read(await files[0].arrayBuffer(), { type: 'array', cellDates: true })
    const names = (options.sheets === 'first' ? wb.SheetNames.slice(0, 1) : wb.SheetNames).filter((n) => wb.Sheets[n]?.['!ref'])
    if (!names.length) throw userError('This spreadsheet has no data to convert.')
    const FS = delimiters[options.delimiter] || ','
    const ext = FS === '\t' ? 'tsv' : 'csv'
    const base = baseName(files[0])
    const safe = (s) => s.replace(/[\\/:*?"<>|]+/g, '-')

    const outputs = names.map((name) => {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name], { FS, blankrows: false, rawNumbers: options.values === 'raw' })
      const blob = new Blob([options.bom === 'bom' ? String.fromCharCode(0xfeff) : '', csv], { type: `text/${ext === 'tsv' ? 'tab-separated-values' : 'csv'};charset=utf-8` })
      const rows = csv ? csv.split('\n').length : 0
      return { name, rows, download: { name: names.length > 1 ? `${base}-${safe(name)}.${ext}` : `${base}.${ext}`, blob } }
    })

    const preview = XLSX.utils.sheet_to_json(wb.Sheets[names[0]], { header: 1, raw: false, defval: '', blankrows: false }).slice(0, 12)
    return {
      downloads: outputs.map((o) => o.download),
      summary: `${outputs.length} CSV file${outputs.length > 1 ? 's' : ''} ready`,
      rows: outputs.map((o) => ({ title: o.name, sub: `${o.rows} row${o.rows === 1 ? '' : 's'} · ${o.download.name}`, download: o.download })),
      table: preview.map((row) => row.slice(0, 12).map((c) => String(c).slice(0, 40))),
    }
  },
}
