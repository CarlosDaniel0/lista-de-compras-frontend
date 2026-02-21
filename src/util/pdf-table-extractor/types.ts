export interface Position {
  y?: number,
  x?: number,
  lines: any[] 
}

export interface Edge {
  x: number,
  y: number,
  width: number,
  height: number,
  transform: TransformMatrix,
}

export interface Merge {
  row: number,
  col: number,
  width: number,
  height: number,
}

export interface Line {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number
}

export type TransformMatrix = [number, number, number, number, number, number]

export interface PageTable {

}

export interface PDFExtractionResult {
  page: number,
  tables: string[][],
  merges: Record<string, string>,
  merge_alias: Record<string, string>,
  width: number,
  height: number
}

export type TableHeaderDomain = 'integer' | 'text' |  'decimal' | 'monetary' | 'rest'
export type TableHeaderType =  TableHeaderDomain | `integer:${number}` | `text:${number}` | `decimal:${number}`

export interface Clause {
  format: (value: string) => any,
  domain: TableHeaderDomain;
  field: string;
  regex: RegExp;
  precision: string;
  label: string;
}