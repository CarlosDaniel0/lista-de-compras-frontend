import { PDFDocumentProxy } from 'pdfjs-dist'
import {
  PDFExtractionResult,
} from './types'

export default async function pdfTableExtractor(doc: PDFDocumentProxy) {
  const numPages = doc.numPages
  const result = {
    pageTables: [] as PDFExtractionResult[],
    numPages: numPages,
    currentPages: 0,
  }

  let lastPromise = Promise.resolve() // will be used to chain promises
  const loadPage = async (pageNum: number) => {
    return doc.getPage(pageNum).then(async (page) => {
      let text = ''
      return page.getTextContent().then((content) => {
        let lastY = null
        let pageText = ''

        for (let item of content.items) {
          if (!('transform' in item)) return
          if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
            pageText += '\n'
          } else if (lastY !== null) {
          }
          pageText += item.str
          lastY = item.transform[5]
        }
        text += pageText + '\n\n'

        if (text) {
          result.pageTables.push({
            page: pageNum,
            table: text,
          })
        }
        result.currentPages++
      })
    })
  }

  for (let i = 1; i <= numPages; i++) {
    lastPromise = lastPromise.then(loadPage.bind(null, i))
  }
  return lastPromise.then(() => result)
}
