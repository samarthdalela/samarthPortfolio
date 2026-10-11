// File converters used by FileConverter, by id. Each id matches a page's `toolProps.converter` in
// src/data/landings.js. Heavy libraries are imported inside each converter's convert() on first use.

import csvToExcel from './csvToExcel'
import excelToCsv from './excelToCsv'
import excelToPdf from './excelToPdf'
import odtToDocx from './odtToDocx'
import pdfToExcel from './pdfToExcel'
import pdfToPpt from './pdfToPpt'
import pptToPdf from './pptToPdf'
import rtfToPdf from './rtfToPdf'
import txtToPdf from './txtToPdf'
import wordToHtml from './wordToHtml'

export const converters = {
  'pdf-to-excel': pdfToExcel,
  'excel-to-pdf': excelToPdf,
  'pdf-to-powerpoint': pdfToPpt,
  'powerpoint-to-pdf': pptToPdf,
  'word-to-html': wordToHtml,
  'excel-to-csv': excelToCsv,
  'csv-to-excel': csvToExcel,
  'odt-to-docx': odtToDocx,
  'rtf-to-pdf': rtfToPdf,
  'txt-to-pdf': txtToPdf,
}
