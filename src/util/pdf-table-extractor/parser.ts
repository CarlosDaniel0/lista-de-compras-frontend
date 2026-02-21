import { Clause, TableHeaderDomain, TableHeaderType } from './types'

export default function parseTextToJSON(
  text: string,
  header: Record<string, { label: string; type: TableHeaderType }>,
) {
  if (!text) return []
  const matchs = text.matchAll(/((\d+),(\d{2}))$|Total/gm)
  const lines: string[] = []
  const extracted: any[] = []
  const headers = Object.entries(header).map(type)
  let start = 0
  for (const match of matchs) {
    const index = match[0].length + match.index
    const value = text.substring(start, index)
    start = index
    lines.push(value.replace(/\n/g, ' '))
  }
  for (const line of lines) {
    const other: string[] = []
    const items = line.split(' ').filter((e) => !!e)
    const item: Record<string, any> = {}
    let rest: Clause | undefined
    const loopHeaders = [...headers]
    while (items.length) {
      const head = loopHeaders.shift()

      if (head && head.domain === 'rest' && !head.label.includes(items[0])) {
        rest = head
        items.reverse()
        loopHeaders.reverse()
        continue
      }
      const value = items.shift()!
      if (head) {
        if (head.label.includes(value) && !extracted.length)
          item[head.field] = buffer(value, head.label, items)
        if (head.regex.test(value)) item[head.field] = head.format(value)
        continue
      }
      if (rest) {
        other.push(value)
        if (!items.length) item[rest.field] = other.reverse().join(' ').trim()
      }
    }
    extracted.push(JSON.parse(JSON.stringify(item)))
  }
  return extracted
}

function buffer(value: string, label: string, items: string[]) {
  const str = [value]
  if (value === label) return value
  while (items.length && str.join(' ') !== label) {
    str.push(items.shift()!)
  }
  return str.join(' ')
}

function type(item: [string, { label: string; type: TableHeaderType }]) {
  const [field, props] = item
  const { type, label } = props
  const [domain, precision] = type.split(':') as [TableHeaderDomain, string]

  let regex = new RegExp('')
  let format: (value: string) => any = (value: string) => value
  switch (domain) {
    case 'integer':
      regex = new RegExp(
        String.raw`^(\d${precision ? `{${precision}}` : '+'})$`,
      )
      format = (value: string) =>
        Number(value.replace(/\./g, '').replace(',', '.'))
      break
    case 'text':
      regex = new RegExp(
        String.raw`^(\w${precision ? `{${precision}}` : '+'})$`,
      )
      break
    case 'decimal':
      regex = new RegExp(
        String.raw`(\d+)(?:(\,(\d${precision ? `{${precision}}` : '+'}))|)`,
      )
      format = (value: string) =>
        Number(value.replace(/\./g, '').replace(',', '.'))
      break
    case 'monetary':
      regex = new RegExp(
        String.raw`^(\d+),(\d${precision ? `{${precision}}` : '{2}'})`,
      )
      format = (value: string) =>
        Number(value.replace(/\./g, '').replace(',', '.'))
      break
    case 'rest':
    default:
      regex = new RegExp(String.raw`(.*${precision ? `{${precision}}` : '?'})`)
      break
  }
  return { domain, field, regex, precision, label, format } as Clause
}
