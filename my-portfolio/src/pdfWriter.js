// Minimal PDF 1.4 writer shared by the PDF tools: one page per JPEG, embedded as-is with DCTDecode (no
// re-compression). Each page: { pw, ph } page size in points, { x, y, dw, dh } image box, img: { bytes, w, h }.
export function buildPdf(pages) {
  const enc = new TextEncoder()
  const chunks = []
  const offsets = []
  let length = 0
  const push = (data) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data
    chunks.push(bytes)
    length += bytes.length
  }
  const object = (n, ...parts) => {
    offsets[n] = length
    push(`${n} 0 obj\n`)
    parts.forEach(push)
    push('\nendobj\n')
  }
  const num = (v) => +v.toFixed(2)

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  const pageRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`)

  pages.forEach((p, i) => {
    const pageNo = 3 + i * 3
    const contentNo = pageNo + 1
    const imageNo = pageNo + 2
    const content = `q ${num(p.dw)} 0 0 ${num(p.dh)} ${num(p.x)} ${num(p.y)} cm /Im0 Do Q`
    object(
      pageNo,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(p.pw)} ${num(p.ph)}] ` +
        `/Resources << /XObject << /Im0 ${imageNo} 0 R >> >> /Contents ${contentNo} 0 R >>`,
    )
    object(contentNo, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    object(
      imageNo,
      `<< /Type /XObject /Subtype /Image /Width ${p.img.w} /Height ${p.img.h} /ColorSpace /DeviceRGB ` +
        `/BitsPerComponent 8 /Filter /DCTDecode /Length ${p.img.bytes.length} >>\nstream\n`,
      p.img.bytes,
      '\nendstream',
    )
  })

  const count = 3 + pages.length * 3
  const xref = length
  push(`xref\n0 ${count}\n0000000000 65535 f \n`)
  for (let n = 1; n < count; n++) push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(chunks, { type: 'application/pdf' })
}
