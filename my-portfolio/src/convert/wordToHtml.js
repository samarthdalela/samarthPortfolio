import { baseName, userError } from './common'

const pageCss = `body { font-family: Calibri, Carlito, 'Segoe UI', Arial, sans-serif; line-height: 1.5; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #222 }
img { max-width: 100%; height: auto }
table { border-collapse: collapse; margin: 1rem 0 }
td, th { border: 1px solid #ccc; padding: 0.35rem 0.6rem; vertical-align: top }
h1, h2, h3 { line-height: 1.25 }`

// Puts each block element on its own line so the HTML is readable.
const pretty = (html) => html.replace(/(<\/(?:p|h[1-6]|li|ul|ol|table|tr|thead|tbody|blockquote|pre)>)/g, '$1\n').replace(/(<(?:ul|ol|table|tr|tbody|thead)>)/g, '$1\n')

const page = (title, body) =>
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title.replace(/</g, '&lt;')}</title>\n<style>\n${pageCss}\n</style>\n</head>\n<body>\n${body}</body>\n</html>\n`

export default {
  accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  drop: 'Drop a Word file here or click to browse',
  hint: 'Word documents (.docx) · clean HTML with headings, lists, tables, links and images',
  wrongFile: 'Please choose a Word document (.docx). Old .doc files must be saved as .docx first.',
  action: 'Convert to HTML',
  downloadLabel: 'Download HTML file',
  empty: 'Your HTML and a live preview will appear here.',
  errorMessage: 'This document could not be converted. Make sure it is a .docx file that opens in Word.',
  options: [
    { key: 'output', label: 'Output', default: 'page', choices: [['page', 'Full web page (with simple styling)'], ['body', 'HTML fragment only (paste into a CMS)']] },
    { key: 'images', label: 'Images', default: 'embed', choices: [['embed', 'Embed images (Base64)'], ['none', 'Leave images out']] },
  ],
  async convert({ files, options, setStatus }) {
    setStatus('Reading document…')
    const mammoth = (await import('mammoth')).default
    const settings =
      options.images === 'none' ? { convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '' })) } : {}
    const { value } = await mammoth.convertToHtml({ arrayBuffer: await files[0].arrayBuffer() }, settings)
    let body = options.images === 'none' ? value.replace(/<img [^>]*src=""[^>]*\/?>/g, '') : value
    if (!body.trim()) throw userError('No content was found in this document.')
    body = pretty(body)
    const name = baseName(files[0])
    const html = options.output === 'page' ? page(name, body) : body
    return {
      downloads: [{ name: `${name}.html`, blob: new Blob([html], { type: 'text/html;charset=utf-8' }) }],
      summary: `HTML ready · ${(html.length / 1024).toFixed(1)} KB`,
      code: { label: 'HTML', text: html },
      previewHtml: options.output === 'page' ? html : page(name, body),
    }
  },
}
