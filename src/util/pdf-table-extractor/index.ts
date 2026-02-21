/**
 * Credits to https://github.com/ronnywang
 * https://github.com/ronnywang/pdf-table-extractor/blob/master/pdf-table-extractor.js
 */

import { OPS, PDFDocumentProxy } from 'pdfjs-dist'
import {
  Edge,
  Line,
  PDFExtractionResult,
  Position,
  TransformMatrix,
  Merge,
} from './types'
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'

export default async function pdfTableExtractor(doc: PDFDocumentProxy) {
  const numPages = doc.numPages
  const result = {
    pageTables: [] as PDFExtractionResult[],
    numPages: numPages,
    currentPages: 0,
  }

  const transform = (m1: number[], m2: number[]): TransformMatrix => {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ]
  }

  const applyTransform = (p: number[], m: number[]) => {
    const xt = p[0] * m[0] + p[1] * m[2] + m[4]
    const yt = p[0] * m[1] + p[1] * m[3] + m[5]
    return [xt, yt]
  }

  let lastPromise = Promise.resolve() // will be used to chain promises
  const loadPage = async (pageNum: number) => {
    return doc.getPage(pageNum).then(async (page) => {
      const verticles: Position[] = []
      const horizons: Position[] = []
      const merges: Record<string, string> = {}
      const merge_alias: Record<string, string> = {}
      let transformMatrix: TransformMatrix = [1, 0, 0, 1, 0, 0]
      const transformStack: TransformMatrix[] = []

      return page
        .getOperatorList()
        .then((opList) => {
          // Get rectangle first
          const showed: Record<string, string> = {}
          const ROPS = Object.entries(OPS).reduce((acc, [key, value]) => {
            acc[value] = key
            return acc
          }, [] as string[])
          let edges: Edge[] = []
          const line_max_width = 2

          while (opList.fnArray.length) {
            const fn = opList.fnArray.shift()!
            const args = opList.argsArray.shift()

            if (OPS.constructPath === fn) {
              let path: [number, number][] = []
              let path_x_min = null,
                path_x_max = null,
                path_y_min = null,
                path_y_max = null
              const curr_fn = args[0]
              for (let ops of args[1]) {
                if (ops === null) {
                  continue
                }
                ops = Array.from(ops)
                while (ops.length) {
                  const op = ops.shift()
                  if (op == OPS.rectangle) {
                    throw 'rectangle not expected'
                  } else if ([0, OPS.dependency].includes(op)) {
                    const x = ops.shift()
                    const y = ops.shift()
                    if (null === path_x_min) {
                      path_x_min = path_x_max = x
                      path_y_min = path_y_max = y
                    } else {
                      path_x_min = Math.min(path_x_min, x)
                      path_x_max = Math.max(path_x_max, x)
                      path_y_min = Math.min(path_y_min, y)
                      path_y_max = Math.max(path_y_max, y)
                    }
                    path.push([x, y])
                  } else if (op == OPS.setLineJoin) {
                    if ([OPS.eoFill, OPS.fill].includes(curr_fn)) {
                      const width = path_x_max - path_x_min
                      const height = path_y_max - path_y_min
                      if (height > width && height > line_max_width) {
                        edges.push({
                          x: path_x_min,
                          y: path_y_min,
                          width: 0,
                          height: height,
                          transform: transformMatrix,
                        })
                      } else if (width > height && width > line_max_width) {
                        edges.push({
                          x: path_x_min,
                          y: path_y_min,
                          width: width,
                          height: 0,
                          transform: transformMatrix,
                        })
                      } else {
                        // do nothing
                      }
                    }
                    path = []
                    path_x_min = path_x_max = path_y_min = path_y_max = null
                  } else {
                    //throw ('constructPath ' + op);
                  }
                }
              }
            } else if (OPS.save === fn) {
              transformStack.push(transformMatrix)
            } else if (OPS.restore === fn) {
              transformMatrix = transformStack.pop()!
            } else if (OPS.transform === fn) {
              transformMatrix = transform(transformMatrix, args)
            } else if ('undefined' === typeof showed[fn]) {
              showed[fn] = ROPS[fn]
            } else {
            }
          }
          edges = edges.map((edge) => {
            if ('undefined' === typeof edge.width) {
              edge.width = 0
            }
            if ('undefined' === typeof edge.height) {
              edge.height = 0
            }
            const point1 = applyTransform([edge.x, edge.y], edge.transform)
            const point2 = applyTransform(
              [edge.x + edge.width, edge.y + edge.height],
              edge.transform,
            )
            return {
              x: Math.min(point1[0], point2[0]),
              y: Math.min(point1[1], point2[1]),
              width: Math.abs(point1[0] - point2[0]),
              height: Math.abs(point1[1] - point2[1]),
            } as Edge
          })
          edges = edges.filter(
            (edge) =>
              edge.width >= line_max_width || edge.height >= line_max_width,
          )
          // filter edges don't cross to other edges
          // Ver depois aqui! 🔎
          edges = edges.filter((edge) => {
            for (const checking_edge of edges) {
              if (edge === checking_edge) {
                continue
              }

              if (edge.width > line_max_width) {
                // horizon line
                if (
                  checking_edge.x > edge.x + edge.width ||
                  checking_edge.x + checking_edge.width < edge.x
                ) {
                  continue
                }
                if (
                  checking_edge.y > edge.y &&
                  checking_edge.y + checking_edge.height < edge.y + edge.height
                ) {
                  return false
                }
              }
              if (edge.height > line_max_width) {
                // verticle line
                if (
                  checking_edge.y > edge.y + edge.height ||
                  checking_edge.y + checking_edge.height < edge.y
                ) {
                  continue
                }
                if (
                  checking_edge.x > edge.x &&
                  checking_edge.x + checking_edge.width < edge.x + edge.width
                ) {
                  return false
                }
              }
            }
            return true
          })

          // merge rectangle to verticle lines and horizon lines
          const srcEdges: Edge[] = JSON.parse(JSON.stringify(edges))
          const [edgesX, edgesY] = [
            [...srcEdges].sort((a, b) => a.x - b.x || a.y - b.y),
            [...srcEdges].sort((a, b) => a.y - b.y || a.x - b.x),
          ]

          // get verticle lines
          let current_x: number | null = null,
            current_y: number | null = null,
            current_height = 0,
            lines: Line[] = []
          const linesAddVerticle = (
            lines: Line[],
            top: number | null,
            bottom: number | null,
          ) => {
            let hit = false
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].bottom! < top! || lines[i].top! > bottom!) {
                continue
              }
              hit = true

              top = Math.min(lines[i].top!, top!)
              bottom = Math.max(lines[i].bottom!, bottom!)
              let new_lines: Line[] = []
              if (i > 1) {
                new_lines = lines.slice(0, i - 1)
              }
              new_lines = new_lines.concat(lines.slice(i + 1))
              lines = new_lines
              return linesAddVerticle(lines, top, bottom)
            }
            if (!hit) {
              lines.push({ top: top!, bottom: bottom! })
            }
            return lines
          }

          let edge: undefined | Edge
          while ((edge = edgesX.shift())) {
            // skip horizon lines
            if (edge.width > line_max_width) {
              continue
            }

            // new verticle lines
            if (null === current_x || edge.x - current_x > line_max_width) {
              if (current_height > line_max_width) {
                lines = linesAddVerticle(
                  lines,
                  current_y,
                  current_y! + current_height,
                )
              }
              if (null !== current_x && lines.length) {
                verticles.push({ x: current_x, lines: lines })
              }
              current_x = edge.x
              current_y = edge.y
              current_height = 0
              lines = []
            }

            if (Math.abs(current_y! + current_height - edge.y) < 10) {
              current_height = edge.height + edge.y - current_y!
            } else {
              if (current_height > line_max_width) {
                lines = linesAddVerticle(
                  lines,
                  current_y,
                  current_y! + current_height,
                )
              }
              current_y = edge.y
              current_height = edge.height
            }
          }
          if (current_height > line_max_width) {
            lines = linesAddVerticle(
              lines,
              current_y,
              current_y! + current_height,
            )
          }

          // no table
          if (current_x === null || lines.length == 0) {
            return {}
          }
          verticles.push({ x: current_x, lines: lines })

          // Get horizon lines
          current_x = null
          current_y = null
          let current_width = 0
          const linesAddHorizon = (
            lines: Line[],
            left: number | null,
            right: number | null,
          ) => {
            let hit = false
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].right! < left! || lines[i].left! > right!) {
                continue
              }
              hit = true

              left = Math.min(lines[i].left!, left!)
              right = Math.max(lines[i].right!, right!)
              let new_lines: Line[] = []
              if (i > 1) {
                new_lines = lines.slice(0, i - 1)
              }
              new_lines = new_lines.concat(lines.slice(i + 1))
              lines = new_lines
              return linesAddHorizon(lines, left, right)
            }
            if (!hit) {
              lines.push({ left: left!, right: right! })
            }
            return lines
          }

          while ((edge = edgesY.shift())) {
            if (edge.height > line_max_width) {
              continue
            }
            if (null === current_y || edge.y - current_y > line_max_width) {
              if (current_width > line_max_width) {
                lines = linesAddHorizon(
                  lines,
                  current_x,
                  current_x! + current_width,
                )
              }

              if (null !== current_y && lines.length) {
                horizons.push({ y: current_y, lines: lines })
              }
              current_x = edge.x
              current_y = edge.y
              current_width = 0
              lines = []
            }

            if (Math.abs(current_x! + current_width - edge.x) < 10) {
              current_width = edge.width + edge.x - current_x!
            } else {
              if (current_width > line_max_width) {
                lines = linesAddHorizon(
                  lines,
                  current_x,
                  current_x! + current_width,
                )
              }
              current_x = edge.x
              current_width = edge.width
            }
          }
          if (current_width > line_max_width) {
            lines = linesAddHorizon(
              lines,
              current_x,
              current_x! + current_width,
            )
          }
          // no table
          if (current_y === null || lines.length == 0) {
            return {}
          }
          horizons.push({ y: current_y, lines: lines })

          const searchIndex = (v: number, list: number[]) => {
            for (let i = 0; i < list.length; i++) {
              if (Math.abs(list[i] - v) < 5) {
                return i
              }
            }
            return -1
          }

          // handle merge cells
          const x_list = verticles.map((a) => a.x!)

          // check top_out and bottom_out
          const y_list = horizons.map((a) => a.y!).sort((a, b) => b - a)
          const y_max = verticles
            .map((verticle) => verticle.lines[0].bottom)
            .sort()
            .reverse()[0]
          const y_min = verticles
            .map((verticle) => verticle.lines[verticle.lines.length - 1].top)
            .sort()[0]
          const top_out = searchIndex(y_min, y_list) === -1 ? 1 : 0
          const bottom_out = searchIndex(y_max, y_list) === -1 ? 1 : 0

          const verticle_merges: Record<string, Merge> = {}
          // skip the 1st lines and final lines
          for (let r = 0; r < horizons.length - 2 + top_out + bottom_out; r++) {
            const hor = horizons[bottom_out + horizons.length - r - 2]
            lines = hor.lines.slice(0)
            let col = searchIndex(lines[0].left!, x_list)
            if (col != 0) {
              for (let c = 0; c < col; c++) {
                verticle_merges[[r, c].join('-')] = {
                  row: r,
                  col: c,
                  width: 1,
                  height: 2,
                }
              }
            }
            let line: undefined | Line
            while ((line = lines.shift())) {
              const left_col = searchIndex(line.left!, x_list)
              const right_col = searchIndex(line.right!, x_list)
              if (left_col != col) {
                for (let c = col; c < left_col; c++) {
                  verticle_merges[[r, c].join('-')] = {
                    row: r,
                    col: c,
                    width: 1,
                    height: 2,
                  }
                }
              }
              col = right_col
            }
            if (col != verticles.length - 1 + top_out) {
              for (let c = col; c < verticles.length - 1 + top_out; c++) {
                verticle_merges[[r, c].join('-')] = {
                  row: r,
                  col: c,
                  width: 1,
                  height: 2,
                }
              }
            }
          }

          while (true) {
            let merged = false
            for (let r_c in verticle_merges) {
              const m = verticle_merges[r_c]
              const final_id = [m.row + m.height - 1, m.col + m.width - 1].join(
                '-',
              )
              if ('undefined' !== typeof verticle_merges[final_id]) {
                verticle_merges[r_c].height +=
                  verticle_merges[final_id].height - 1
                delete verticle_merges[final_id]
                merged = true
                break
              }
            }
            if (!merged) {
              break
            }
          }

          const horizon_merges: Record<string, Merge> = {}
          for (let c = 0; c < verticles.length - 2; c++) {
            const ver = verticles[c + 1]
            lines = ver.lines.slice(0)
            let row = searchIndex(lines[0].bottom!, y_list) + bottom_out
            if (row != 0) {
              for (let r = 0; r < row; r++) {
                horizon_merges[[r, c].join('-')] = {
                  row: r,
                  col: c,
                  width: 2,
                  height: 1,
                }
              }
            }
            let line: Line | undefined
            while ((line = lines.shift())) {
              let top_row = searchIndex(line.top!, y_list)
              if (top_row == -1) {
                top_row = y_list.length + bottom_out
              } else {
                top_row += bottom_out
              }
              let bottom_row = searchIndex(line.bottom!, y_list) + bottom_out
              if (bottom_row != row) {
                for (let r = bottom_row; r < row; r++) {
                  horizon_merges[[r, c].join('-')] = {
                    row: r,
                    col: c,
                    width: 2,
                    height: 1,
                  }
                }
              }
              row = top_row
            }
            if (row != horizons.length - 1 + bottom_out + top_out) {
              for (
                let r = row;
                r < horizons.length - 1 + bottom_out + top_out;
                r++
              ) {
                horizon_merges[[r, c].join('-')] = {
                  row: r,
                  col: c,
                  width: 2,
                  height: 1,
                }
              }
            }
          }
          if (top_out) {
            horizons.unshift({ y: y_min, lines: [] })
          }
          if (bottom_out) {
            horizons.push({ y: y_max, lines: [] })
          }

          while (true) {
            let merged = false
            for (let r_c in horizon_merges) {
              const m = horizon_merges[r_c]
              const final_id = [m.row + m.height - 1, m.col + m.width - 1].join(
                '-',
              )
              if ('undefined' !== typeof horizon_merges[final_id]) {
                horizon_merges[r_c].width += horizon_merges[final_id].width - 1
                delete horizon_merges[final_id]
                merged = true
                break
              }
            }
            if (!merged) {
              break
            }
          }
          const merges = verticle_merges
          for (let id in horizon_merges) {
            if ('undefined' !== typeof merges[id]) {
              merges[id].width = horizon_merges[id].width
            } else {
              merges[id] = horizon_merges[id]
            }
          }
          for (let id in merges) {
            for (let c = 0; c < merges[id].width; c++) {
              for (let r = 0; r < merges[id].height; r++) {
                if (c == 0 && r == 0) {
                  continue
                }
                delete merges[
                  [r + merges[id].row, c + merges[id].col].join('-')
                ]
              }
            }
          }

          const merge_alias: Record<string, string> = {}
          for (let id in merges) {
            for (let c = 0; c < merges[id].width; c++) {
              for (let r = 0; r < merges[id].height; r++) {
                if (r == 0 && c == 0) {
                  continue
                }
                merge_alias[
                  [merges[id].row + r, merges[id].col + c].join('-')
                ] = [merges[id].row, merges[id].col].join('-')
              }
            }
          }
        })
        .then(async () => {
          return page.getTextContent().then((content) => {
            let tables: string[][] = []
            const table_pos: (number | null)[][] = []
            for (let i = 0; i < horizons.length - 1; i++) {
              tables[i] = [] as string[]
              table_pos[i] = []
              for (let j = 0; j < verticles.length - 1; j++) {
                tables[i][j] = ''
                table_pos[i][j] = null
              }
            }
            let item: TextItem | TextMarkedContent | undefined
            while ((item = content.items.shift())) {
              let x = -1,
                y = -1
              if ('transform' in item) {
                x = item.transform[4]
                y = item.transform[5]
              }

              let col = -1
              for (let i = 0; i < verticles.length - 1; i++) {
                if (x >= verticles[i].x! && x < verticles[i + 1].x!) {
                  col = i
                  break
                }
              }
              if (col == -1) {
                continue
              }
              let row = -1
              for (let i = 0; i < horizons.length - 1; i++) {
                if (y >= horizons[i].y! && y < horizons[i + 1].y!) {
                  row = horizons.length - i - 2
                  break
                }
              }
              if (row == -1) {
                continue
              }

              if ('undefined' !== typeof merge_alias[row + '-' + col]) {
                const id = merge_alias[row + '-' + col]
                row = Number(id.split('-')[0])
                col = Number(id.split('-')[1])
              }
              if (
                null !== table_pos[row][col] &&
                Math.abs(table_pos[row][col]! - y) > 5
              ) {
                tables[row][col] += '\n'
              }
              table_pos[row][col] = y
              tables[row][col] += (item as TextItem).str
            }
            if (tables.length) {
              result.pageTables.push({
                page: pageNum,
                tables: tables,
                merges: merges,
                merge_alias: merge_alias,
                width: verticles.length - 1,
                height: horizons.length - 1,
              })
            }
            result.currentPages++
          })
        })
    })
  }

  for (let i = 1; i <= numPages; i++) {
    lastPromise = lastPromise.then(loadPage.bind(null, i))
  }
  return lastPromise.then(() => result)
}
