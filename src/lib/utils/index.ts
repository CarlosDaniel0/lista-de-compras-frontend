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

export const formatParams = (params: string) => {
  return !params ? {} : Object.fromEntries(
    params
      .substring(1)
      .split('&')
      .map((item) => item.split('='))
  )
}