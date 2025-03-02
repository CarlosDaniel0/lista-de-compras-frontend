/* eslint-disable @typescript-eslint/no-explicit-any */
export const databaseErrorResponse = (message: string) => ({
  status: false,
  message: message ?? 'Database connection failed',
})

export const formatSQLResult = <E>(res: E) => {
  const item = Array.isArray(res) ? (res as never)?.[0] as unknown as { columns: string[]; values: string[][] } : { columns: [], values: [] }
  if (item && 'columns' in item && 'values' in item)
    return item.values.map((el) =>
      Object.fromEntries(
        el.map((v, i) => [
          (item as unknown as { columns: string[]; values: string[][] })
            .columns[i],
          v,
        ])
      )
    ) as E[]
  return null
}

export const uuidv4 = () => {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

export const formatParams = (pathname: string, matches: string[]) => {
  const [path, paths] = [pathname.split('/'), matches.map(item => item.split('/'))] as [string[], string[][]]
  const i = paths.findIndex((item) => 
    item.filter(el => el.includes(':')).length === path.filter(p => !item.includes(p)).length
    && item.length === path.length)

  if (i === -1) throw new Error('Route Not Founded!')
  const keys = path.filter(p => !paths[i].includes(p))
  const name = paths[i].join('/')
  const params = Object.fromEntries(paths[i]
    .filter(p => String(p ?? '').includes(':'))
    .map((key, i) => [key.replace(':', ''), keys[i]]))
  return [name, params] as [string, any]
}

export const formatQueryParams = (params: string) => {
  return !params ? {} : Object.fromEntries(
    params
      .substring(1)
      .split('&')
      .map((item) => item.split('='))
  )
} 

export const aggregateByKey = <T,>(arr: T[], field: keyof T) => {
  const map = new Map<string, any>()
  arr.forEach(item => map.set(String(item[field]), item))
  return Array.from(map.values()) as T[]
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

export const trunc = (num: number, decimals: number = 2) => Math.trunc(num * Math.pow(10, decimals)) / Math.pow(10, decimals)

export const sum = <T,>(arr: T[], field: keyof T) => {
  return arr.reduce((tot, item) => decimalSum(tot, Number(item?.[field] ?? 0)), 0)
}

export const captalize = (text: string) => text.substring(0, 1).toUpperCase() + text.slice(1)