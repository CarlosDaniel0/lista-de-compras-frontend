import { format } from 'date-fns'
import { API_URL, DEBUG, MAX_REQUEST_TIMEOUT } from './constants'

type HTTPMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
// const colors = {
//   error: 'color: #fc5858;',
//   warn: 'color: #fff373;',
//   info: 'color: #82aaff;',
//   log: 'color:rgb(235, 235, 235);'
// }

const hightlight = (
  value: string
  // type: 'error' | 'warn' | 'info' | 'log'
) => {
  let str = value

  const styles: string[] = []
  str = str.replace(/"(.*?)"/g, (item) => {
    styles.push('color: #e77647')
    styles.push('')
    return `%c${item}%c`
  })
  return [str, styles]
}

const groupConsoles = <T extends [(...value: string[]) => void, string[]]>(
  acc: T[],
  item: T
) => {
  const index = Math.max(acc.length - 1, 0)
  if (
    ['log', 'info', 'warn', 'wrror'].includes(item[0].name) &&
    acc.length &&
    acc[index][0].name === 'log'
  ) {
    acc[index][1][0] += `\n${item[1][0]}`
    item[1].slice(1).forEach((style) => acc[index][1].push(style))
  } else acc.push(item)
  return acc
}

export const collapseJSON = (str: string) => {
  const lines = (
    str.split('\n').flatMap((line, i) => {
      const formatted = line.replace(/(\s+)/, '  ')
      const hasOpen = ['{', '['].some((char) => formatted.includes(char))
      const hasClose = ['}', ']'].some((char) => formatted.includes(char))
      const [str, color] = hightlight(formatted)
      const value = [str, ...color]
      if (hasOpen && !hasClose) return [[console?.[i ? 'group' : 'groupCollapsed'], value]]
      if (hasClose && !hasOpen)
        return [[console.log, value], [console.groupEnd]]
      return [[console.log, value]]
    }) as [(...value: string[]) => void, string[]][]
  ).reduce<[(...value: string[]) => void, string[]][]>(groupConsoles, [])

  lines.forEach(([fn, line]) => (line?.length ? fn(...line) : fn()))
}

// typeLog: 'error' | 'warn' | 'info' | 'log'
const print =
  () =>
  (
    type: 'req' | 'res',
    message: string | Record<string, unknown>,
    url: string = '',
    method: HTTPMethod = 'GET'
  ) => {
    if (!DEBUG) return
    const now = format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
    const header = `${url !== '' ? `\n${method}` : ''}:${
      url !== '' ? `${url}\n` : ''
    }`
    console.log(
      `${type === 'req' ? 'Requisição' : 'Resposta'}${' '.repeat(
        5
      )}${now}${header}`
    )
    if (!message) return
    console.log('Body: ')
    collapseJSON(JSON.stringify(message, null, 2))
  }

export const log = {
  error: print(), // 'error'
  info: print(), // 'info'
  warn: print(), // 'warn'
}

export const currency = Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const genId = (prefix: string) =>
  prefix + Math.random().toString(16).slice(2)

export const request = async <T = never, K = unknown>(
  params: string,
  body?: K,
  method?: HTTPMethod
): Promise<T> => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), MAX_REQUEST_TIMEOUT)
  const url = `${API_URL}${params}`
  log.info('req', body ? body : '', url, method)
  return fetch(url, {
    method: method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal,
  })
    .then((res) => {
      switch (res.status) {
        case 401:
          throw new Error('Usuário não autorizado')
        case 404:
          throw new Error('Rota não encontrada')
        case 200:
          return res.text()
        default:
          throw new Error(
            `Ocorreu um erro inesperado: Status Code: ${res.status}`
          )
      }
    })
    .then((res) => {
      let json = {}
      try {
        json = JSON.parse(res)
      } catch (e) {
        log.error('res', e instanceof Error ? e.message : 'Error in JSON parse')
      }
      log.info('res', json)
      return json as T
    })
    .catch((err) => {
      if (err.message.includes('Failed to fetch'))
        throw new Error('API Indisponível')
      throw err
    })
}

export const setTheme = (theme: 'dark' | 'light') => {
  const html = document.querySelector('html')
  if (!html) return
  html.setAttribute('theme', theme)
}

export const parseCurrencyToNumber = (value: string) =>
  Number(value.replace(/\./g, '').replace(/,/g, '.'))
export const parseNumberToCurrency = (value?: string | number) =>
  currency.format(Number(value ?? 0)).replace(/R\$(\s)/g, '')
