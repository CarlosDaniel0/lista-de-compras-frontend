import { format } from 'date-fns'
import { API_URL, DEBUG, MAX_REQUEST_TIMEOUT } from './constants'



type HTTPMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
const colors = {
  error: 'color: #fc5858;',
  warn: 'color: #fff373;',
  info: 'color: #82aaff;',
}

const hightlight = (
  obj: string | Record<string, unknown>,
  type: 'error' | 'warn' | 'info'
) => {
  if (typeof obj === 'string') return [`%c${obj}`, [colors[type]]]
  let str = JSON.stringify(obj, null, 2)

  const styles: string[] = []
  str = str.replace(/"(.*?)"/g, (item) => {
    styles.push('color: #e77647')
    styles.push('')
    return `%c${item}%c`
  })
  return ['Body: \n' + str, styles]
}

const print =
  (typeLog: 'error' | 'warn' | 'info') =>
  (
    type: 'req' | 'res',
    message: string | Record<string, unknown>,
    url: string = '',
    method: HTTPMethod = 'GET'
  ) => {
    if (!DEBUG) return
    const now = format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
    const [str, color] = hightlight(message, typeLog)
    const header = `${url !== '' ? `\n${method}` : ''}:${url !== '' ? `${url}\n` : ''}`
    console.log(
      `${type === 'req' ? 'Requisição' : 'Resposta'}${' '.repeat(5)}${now}${header}
${str}`,
      ...color
    )
  }

export const log = {
  error: print('error'),
  info: print('info'),
  warn: print('warn'),
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
    signal: controller.signal
  })
    .then((res) => {
      switch(res.status) {
        case 401: throw new Error('Usuário não autorizado')
        case 404: throw new Error('Rota não encontrada')
        case 200: return res.text()
        default: throw new Error(`Ocorreu um erro inesperado: Status Code: ${res.status}`)
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
    }).catch(err => {
      if (err.message.includes('Failed to fetch')) throw new Error('API Indisponível')
      throw err
    })
}

export  const setTheme = (theme: 'dark' | 'light') => {
  const html = document.querySelector('html')
  if (!html) return
  html.setAttribute('theme', theme)
}

export const parseCurrencyToNumber = (value: string) => Number(value.replace(/\./g, '').replace(/,/g, '.'))
export const parseNumberToCurrency = (value?: string | number) => currency.format(Number(value ?? 0)).replace(/R\$(\s)/g, '')