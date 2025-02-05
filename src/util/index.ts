import { format } from 'date-fns'
import { API_URL, DEBUG, MAX_REQUEST_TIMEOUT, online } from './constants'
import { HTTPMethods } from './types'

// const colors = {
//   error: 'color: #fc5858;',
//   warn: 'color: #fff373;',
//   info: 'color: #82aaff;',
//   log: 'color:rgb(235, 235, 235);'
// }
const channel = new BroadcastChannel('status')
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
      if (hasOpen && !hasClose)
        return [[console?.[i ? 'group' : 'groupCollapsed'], value]]
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
    method: HTTPMethods = 'GET'
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

export const decimal = Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

export const genId = (prefix: string) =>
  prefix + Math.random().toString(16).slice(2)

const sendMessageToWorker = (message: Record<string, boolean>) => {
  if (navigator.serviceWorker) channel.postMessage(message)
}

export const request = async <T = never, K = unknown>(
  params: string,
  body?: K,
  method?: HTTPMethods
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
      if (err.message.includes('Failed to fetch')) {
        sendMessageToWorker({ verifyOnlineStatus: true })
        online.status = false
        throw new Error('API Indisponível')
      }
      throw err
    })
}

export const verifyOnlineStatus = () => {
  if ('serviceWorker' in navigator) {
    channel.addEventListener('message', (evt) => {
      const { data } = evt
      if ('onlinestatus' in data) online.status = data.onlinestatus
    })
  }
  window.addEventListener('online', () => {
    sendMessageToWorker({ status: true })
    online.status = true
  })
  window.addEventListener('offline', () => {
    sendMessageToWorker({ status: false })
    online.status = false
  })
  sendMessageToWorker({ verifyOnlineStatus: online.status })
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

export const uuidv4 = () => {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  )
}

/**
 * Somar valores decimais sem erro na precisão decimal
 *
 * Ex: (regular) 1.03 + 1.33 => 2.3600000000000003
 *
 * Ex: (função) decimalSum(1.03, 1.33) => 2.36
 * @param numbers (n1, n2, nk...)
 * @returns  sum
 */
export const decimalSum = (...numbers: number[]): number =>
  numbers.reduce((sum, curr, i, arr) => {
    if (i === arr.length) return sum
    const n1: number = !Number.isNaN(Number(sum ?? 0)) ? Number(sum ?? 0) : 0
    const n2: number = !Number.isNaN(Number(curr ?? 0)) ? Number(curr ?? 0) : 0

    const [intA, decA] =
      n1 % 1 === 0 ? [String(n1), '0'] : String(n1).split('.')
    const [intB, decB] =
      n2 % 1 === 0 ? [String(n2), '0'] : String(n2).split('.')

    if (decA === '0' && decB === '0') return n1 + n2
    const decimals = decA.length > decB.length ? decA.length : decB.length
    return (
      (parseInt(intA + decA.padEnd(decimals, '0')) +
        parseInt(intB + decB.padEnd(decimals, '0'))) /
      Math.pow(10, decimals)
    )
  }, 0)

export const getFiles = async (
  props?: React.ComponentPropsWithoutRef<'input'>
) =>
  new Promise<FileList | null>((resolve) => {
    const input: HTMLInputElement = document.createElement('input')
    input.type = 'file'
    input.style.position = 'absolute'
    input.style.opacity = '0'
    input.style.width = '0'
    input.style.height = '0'
    input.style.visibility = 'hidden'
    Object.assign(input, props)
    document.body.append(input)
    input.click()
    input.addEventListener('cancel', () => resolve(null))
    input.addEventListener('change', (e) => {
      const { files } = e.currentTarget as HTMLInputElement
      input.remove()
      resolve(files)
    })
  })

export const formatFormNumbers = <T>(obj: T, keys: (keyof T)[]): T =>
  Object.fromEntries(
    Object.entries(obj as Record<string, never>).map(([k, v]) =>
      keys.includes(k as keyof T) ? [k, parseCurrencyToNumber(v)] : [k, v]
    )
  ) as T

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time))

export const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result + '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export const JSONToFile = <T>(obj: T, filename: string) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const getImageFromBase64 = (base64: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = base64
  })

export const getImageFromFile = async (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target)
        getImageFromBase64(event.target.result + '')
          .then(resolve)
          .catch(reject)
    }
    reader.readAsDataURL(file)
  })

export const decimalFormatter = (text: string, decimals = 4) => {
  const value = text.replace(/[^0-9,]/g, '')
  const [int, dec] = value.includes(',') ? value.split(',') : [value, '']
  return `${int.replace(/(\d)(?=(\d{3})+(,|$))/g, '$1.')}${
    value.includes(',') ? `,${dec.replace(/,/g, '').substring(0, decimals) ?? ''}` : ''
  }`
}


export const aggregateByKey = <T,>(arr: T[], field: keyof T) => {
  const map = new Map<string, any>()
  arr.forEach(item => map.set(String(item[field]), item))
  return Array.from(map.values()) as T[]
}

export const sum = <T,>(arr: T[], field: keyof T) => {
  return arr.reduce((tot, item) => decimalSum(tot, Number(item?.[field] ?? 0)), 0)
}

export const formatToFilter = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[']/g, '')
