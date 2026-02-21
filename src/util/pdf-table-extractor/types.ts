export interface PDFExtractionResult {
  page: number,
  table: string,
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