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

export const captalize = (text: string) => text.substring(0, 1).toUpperCase() + text.slice(1)