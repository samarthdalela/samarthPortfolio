// Minimal .docx (WordprocessingML) package writer, shared by PDF to Word and ODT to DOCX.
// Callers build the body XML (paragraphs, tables, inline images); this adds the parts Word needs around it.

// Drops characters XML 1.0 does not allow (control codes, unpaired surrogates).
const xmlAllowed = (c) => c === 9 || c === 10 || c === 13 || (c >= 32 && c < 0xd800) || (c > 0xdfff && c < 0xfffe) || c > 0xffff
const xmlSafe = (s) => [...String(s)].filter((ch) => xmlAllowed(ch.codePointAt(0))).join('')
export const esc = (s) => xmlSafe(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const twips = (pt) => Math.max(0, Math.round(pt * 20))
export const EMU_PER_PT = 12700

const W_NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"'

// An inline picture run. rid: relationship id returned by media.add(); n: unique drawing id.
export function imageRun(rid, n, wPt, hPt) {
  const cx = Math.round(wPt * EMU_PER_PT)
  const cy = Math.round(hPt * EMU_PER_PT)
  return (
    `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
    `<wp:docPr id="${n}" name="Picture ${n}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="image${n}"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
    `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
  )
}

const mimeFor = { png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp' }

// Collects images for the package: add(bytes, ext) → relationship id.
export function createMedia() {
  const items = []
  return {
    items,
    add(bytes, ext) {
      const n = items.length + 1
      const name = `image${n}.${ext}`
      items.push({ rid: `rIdImg${n}`, name, bytes, ext })
      return { rid: `rIdImg${n}`, n }
    },
  }
}

const headingStyles = [1, 2, 3, 4, 5, 6]
  .map((l) => {
    const size = [32, 26, 24, 22, 22, 22][l - 1]
    return (
      `<w:style w:type="paragraph" w:styleId="Heading${l}"><w:name w:val="heading ${l}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
      `<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="${l - 1}"/></w:pPr>` +
      `<w:rPr><w:b/><w:bCs/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`
    )
  })
  .join('')

// page: { w, h, top, right, bottom, left } in points. defaults: { font, size (pt), after (pt) }.
export async function writeDocx({ body, media = createMedia(), page, defaults = {} }) {
  const { default: JSZip } = await import('jszip')
  const font = esc(defaults.font || 'Calibri')
  const halfPts = Math.round((defaults.size || 11) * 2)
  const zip = new JSZip()
  const exts = [...new Set(media.items.map((m) => m.ext))]
  for (const m of media.items) zip.file(`word/media/${m.name}`, m.bytes)

  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      exts.map((e) => `<Default Extension="${e}" ContentType="${mimeFor[e] || 'image/png'}"/>`).join('') +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  zip.file(
    'word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      media.items
        .map((m) => `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.name}"/>`)
        .join('') +
      '</Relationships>',
  )
  zip.file(
    'word/styles.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/>` +
      `<w:sz w:val="${halfPts}"/><w:szCs w:val="${halfPts}"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault>` +
      `<w:pPrDefault><w:pPr><w:spacing w:after="${twips(defaults.after || 0)}" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      headingStyles +
      '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblCellMar>' +
      '<w:left w:w="108" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>',
  )
  const landscape = page.w > page.h ? ' w:orient="landscape"' : ''
  const sect =
    `<w:sectPr><w:pgSz w:w="${twips(page.w)}" w:h="${twips(page.h)}"${landscape}/>` +
    `<w:pgMar w:top="${twips(page.top)}" w:right="${twips(page.right)}" w:bottom="${twips(page.bottom)}" w:left="${twips(page.left)}" ` +
    `w:header="${twips(Math.min(36, page.top))}" w:footer="${twips(Math.min(36, page.bottom))}" w:gutter="0"/></w:sectPr>`
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W_NS}><w:body>${body}${sect}</w:body></w:document>`,
  )
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
