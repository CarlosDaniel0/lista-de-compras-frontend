/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  ProductList,
  ProductReciept,
  ProductSupermarket,
  Reciept,
  Supermarket,
  Tables,
  User,
} from '../../util/types'
import { captalize } from '../utils'
import { ArrayParamsORM, ParamsORM } from '../utils/types'
import { Coordinates } from './Coordinates'

const listFields = ['id', 'name', 'date', 'removed', 'sync', 'user_id'] as const
const listOptinalFields = ['user', 'products'] as const
const productListFields = [
  'id',
  'description',
  'unity',
  'quantity',
  'removed',
  'sync',
  'list_id',
  'product_id',
  'supermarket_id',
] as const
const productListOptionalFields = ['list', 'product', 'supermarket'] as const

const productRecieptFields = [
  'id',
  'position',
  'quantity',
  'price',
  'total',
  'discount',
  'removed',
  'sync',
  'receipt_id',
  'product_id',
] as const
const productRecieptOptionalFields = ['receipt', 'product'] as const

const productSupermarketFields = [
  'id',
  'description',
  'unity',
  'category',
  'barcode',
  'price',
  'removed',
  'sync',
  'last_update',
  'supermarket_id',
] as const

const productSupermarketOptionalFields = ['wholesale', 'supermarket'] as const

const recieptFields = [
  'id',
  'name',
  'date',
  'total',
  'discount',
  'removed',
  'sync',
  'supermarket_id',
  'user_id',
] as const
const recieptOptionalFields = ['supermarket', 'user', 'products'] as const
const supermarketFields = ['id', 'name', 'address', 'removed', 'sync'] as const
const supermarketOptionalFields = ['reciepts', 'products', 'coords'] as const
const userFields = ['id', 'name', 'email', 'picture'] as const
const tableFields = ['id', 'name', 'version', 'sync'] as const
const coodinatesFields = ['id', 'lat', 'long', 'supermarket_id'] as const

const tablesFields = {
  List: listFields,
  Reciept: recieptFields,
  Supermarket: supermarketFields,
  ProductList: productListFields,
  ProductSupermarket: productSupermarketFields,
  ProductReciept: productRecieptFields,
}

const assossiations = {
  Reciept: {
    products: { table: 'ProductReciept', field: 'receipt_id', assoc: 'id' },
    supermarket: { table: 'Supermarket', field: 'supermarket_id', assoc: 'id' },
    user: { table: 'User', field: 'user_id', assoc: 'id' },
  },
  ProductReciept: {
    receipt: { table: 'Receipt', field: 'reciept_id', assoc: 'id' },
    product: { table: 'ProductSupermarket', field: 'id', assoc: 'product_id' },
  },
  ProductList: {
    list: { table: 'List', field: 'product_id', assoc: 'id' },
    product: { table: 'ProductSupermarket', field: 'id', assoc: 'product_id' },
    supermarket: { table: 'Supermarket', field: 'product_id', assoc: 'id' },
  },
  List: {
    user: { table: 'User', field: 'list_id', assoc: 'id' },
    products: { table: 'ProductList', field: 'list_id', assoc: 'id' },
  },
  Supermarket: {
    coords: { table: 'Coordinates', field: 'supermarket_id', assoc: 'id' },
    reciepts: { table: 'Reciept', field: 'supermarket_id', assoc: 'id' },
    products: { table: 'ProductSupermarket', field: 'supermarket_id', assoc: 'id' },
    ProductList: { table: 'ProductList', field: 'supermarket_id', assoc: 'id' },
  },
}

const methods = {
  includes: 'LIKE',
  in: 'IN'
}

export class SQLite {
  private readonly channel
  list
  productReciept
  productList
  productSupermarket
  reciept
  supermarket
  user
  coords
  table

  constructor(channel: BroadcastChannel) {
    this.channel = channel
    this.list = this.#ORM<List, typeof listFields, typeof listOptinalFields>(
      'List',
      listFields,
      listOptinalFields
    )
    this.productList = this.#ORM<
      ProductList,
      typeof productListFields,
      typeof productListOptionalFields
    >('ProductList', productListFields, productListOptionalFields)
    this.productReciept = this.#ORM<
      ProductReciept,
      typeof productRecieptFields,
      typeof productRecieptOptionalFields
    >('ProductReciept', productRecieptFields, productRecieptOptionalFields)
    this.productSupermarket = this.#ORM<
      ProductSupermarket,
      typeof productSupermarketFields,
      typeof productSupermarketOptionalFields
    >(
      'ProductSupermarket',
      productSupermarketFields,
      productSupermarketOptionalFields
    )
    this.reciept = this.#ORM<
      Reciept,
      typeof recieptFields,
      typeof recieptOptionalFields
    >('Reciept', recieptFields, recieptOptionalFields)
    this.supermarket = this.#ORM<
      Supermarket,
      typeof supermarketFields,
      typeof supermarketOptionalFields
    >('Supermarket', supermarketFields, supermarketOptionalFields)
    this.user = this.#ORM<User, typeof userFields, []>('User', userFields, [])
    this.coords = this.#ORM<Coordinates, typeof coodinatesFields, []>(
      'Coordinates',
      coodinatesFields,
      []
    )
    this.table = this.#ORM<Tables, typeof tableFields, []>(
      'Tables',
      tableFields,
      []
    )
  }

  #exec = <T>(sql: string) =>
    new Promise<T>((resolve, reject) => {
      // if (!this.ready) return reject(new Error(`SQLite Database starting!`))
      this.channel.addEventListener('message', (evt) => {
        let json = null
        try {
          json = JSON.parse(evt.data)
        } catch (e) {
          if (e instanceof Error) reject(`Database Error: ${e.message}`)
        }
        resolve(json as T)
      })

      this.channel.postMessage(sql)
    })

  #formatConditions = <
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    params: K
  ) => {
    return Object.entries(params ?? {})
      .map(([param, value]) => {
        const [method, v] =
          typeof value === 'object' && !('getDay' in value)
            ? Object.entries(value)[0]
            : [null, value]
        const op = methods[method as keyof typeof methods] ?? '='
        return `${param} ${op} ${this.#formatValue(v, op)}`
      })
      .join(' AND ')
  }

  #formatItems = <
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    params: K
  ) => {
    const entries = Object.entries(params ?? {})
    if (!entries.length) return '*'
    return entries
      .filter(([, show]) => show)
      .map(([k]) => k)
      .join(', ')
  }

  #formatValue = <T extends number | string | boolean | undefined | Date>(
    value: T,
    operation?: string
  ) => {
    const percent = operation === 'LIKE' ? '%' : ''
    switch (typeof value) {
      case 'undefined':
        return 'NULL'
      case 'string':
        if (['true', 'false'].includes(value)) return value
        return `'${percent}${value.replace(/['`]/g, '')}${percent}'`
      case 'number':
      case 'object':
        if (Array.isArray(value))
          return `(${value.map(v => `'${v.toString()}'`).join(',')})`
        if (typeof value === 'object' && 'getDay' in value)
          return `'${value.toJSON()}'`
        return `'${value.toString()}'`
      default:
        return value
    }
  }

  #select = async <
    E,
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    table: string,
    params: K,
    // fields: T,
    optionals: O
  ) => {
    const { where, select, include } = params
    const items = this.#formatItems(select ?? {})
    const conditions = this.#formatConditions(where ?? {})
    const sql = `SELECT ${items} FROM ${table} WHERE 1 = 1${
      conditions ? ` AND ${conditions}` : ''
    };`
    return this.#exec<E[]>(sql).then(async (result) => {
      if (Object.entries(include ?? {}).length && result) {
       
        //** TODO: Mapeamento fraco entre tabelas com multiplos elementos filhos com a tabela pai */
        const items = optionals.filter(
          (k) => k && Object.keys(include ?? {}).includes(k)
        )
        const data: [string, unknown[]|unknown][] = []
        ;(await (async () => {
          for await (const k of items) {
            const { table: t, field, assoc } =
              assossiations[table as keyof typeof assossiations][k as never]
            const res =
              (await this.#select(
                captalize(t),
                {
                  where: {
                    [field]: (result?.[0] as any)?.[assoc],
                  },
                },
                []
              )) ?? []
            data.push([k, /s$/.test(k) ? res : res?.[0]])
          }
        })()) as never
        const format = <T>(item: T, data: any) => ({
          ...item,
          ...Object.fromEntries(data),
        })
        return Array.isArray(result)
          ? result.map((item) => format(item, data))
          : format(result, data)
      }
      return result ?? []
    })
  }

  #formatData = <
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    params: K,
    optionals: O
  ) => {
    return Object.entries(params)
      .filter(([key]) => !optionals.includes(key))
      .reduce(
        (acc, [key, value], i) => {
          acc[0] += !i ? key : `, ${key}`
          acc[1] += !i
            ? this.#formatValue(value)
            : `, ${this.#formatValue(value)}`
          return acc
        },
        ['', ''] as [string, string]
      )
  }

  #create = async <
    E,
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O> | ArrayParamsORM<T>
  >(
    table: string,
    params: K,
    _fields: T,
    optionals: O
  ) => {
    const { data } = params
    if (
      (Array.isArray(data) && !data.length) ||
      !Object.keys(data ?? {}).length
    )
      return null as E
    if (optionals.some((key) => Object.keys(data ?? {}).includes(key))) {
      const items = Object.keys(data ?? {})
        .filter((key) => optionals.includes(key))
        .map((key) => {
          const content = (data as never)?.[key]
          const t =
            assossiations[table as keyof typeof assossiations][key as never]
          return this.#create(
            t,
            { data: content },
            tablesFields[
              `${captalize(key)}${captalize(
                table
              )}` as keyof typeof tablesFields
            ],
            []
          )
        })
      await Promise.all(items)
    }

    const arr = (Array.isArray(data) ? data : [data]).map((item) =>
      this.#formatData(item ?? {}, optionals)
    )
    const [items] = arr[0]
    const rest = arr
      .map((e) => ` (${e[1]})`)
      .join(', ')
      .replace(' ', '')
    const sql = `INSERT OR IGNORE INTO ${table} (${items}) VALUES ${rest};`
    await this.#exec<E>(sql)
    return data as E
  }

  #update = async <
    E,
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    table: string,
    params: K
  ) => {
    const { data, where } = params
    const items = this.#formatConditions(data ?? {})
    const conditions = this.#formatConditions(where ?? {})
    const sql = `UPDATE ${table} SET ${items} WHERE 1 = 1${
      conditions ? ` AND  ${conditions}` : ''
    };`
    return this.#exec<E>(sql)
  }

  #delete = async <
    E,
    T extends ReadonlyArray<string>,
    O extends ReadonlyArray<string>,
    K extends ParamsORM<T, O>
  >(
    table: string,
    params: K
  ) => {
    const { where } = params
    const conditions = this.#formatConditions(where ?? {})
    const sql = `DELETE FROM ${table} WHERE 1 = 1${
      conditions ? ` AND ${conditions}` : ''
    };`
    return this.#exec<E>(sql)
  }

  #ORM = <E, T extends ReadonlyArray<string>, O extends ReadonlyArray<string>>(
    table: string,
    fields: T,
    optionals: O
  ) => {
    return {
      findMany: async (params: ParamsORM<typeof fields, typeof optionals>) =>
        this.#select<
          E,
          typeof fields,
          typeof optionals,
          ParamsORM<typeof fields, typeof optionals>
        >(table, params, optionals),
      findFirst: async (params: ParamsORM<typeof fields, typeof optionals>) => {
        const base = await this.#select<
          E,
          typeof fields,
          typeof optionals,
          ParamsORM<typeof fields, typeof optionals>
        >(table, params, optionals)
        if (base?.length) return base[0] as E
        return null as E
      },
      findUnique: async (
        params: ParamsORM<typeof fields, typeof optionals>
      ) => {
        const base = await this.#select<
          E,
          typeof fields,
          typeof optionals,
          ParamsORM<typeof fields, typeof optionals>
        >(table, params, optionals)
        if (base.length === 1) {
          return base[0] as E
        }
        return null as E
      },
      create: async (params: ParamsORM<typeof fields, typeof optionals>) =>
        this.#create<
          E,
          typeof fields,
          typeof optionals,
          ParamsORM<typeof fields, typeof optionals>
        >(table, params, fields, optionals),
      createMany: async (params: ArrayParamsORM<typeof fields>) =>
        this.#create<
          E,
          typeof fields,
          typeof optionals,
          ArrayParamsORM<typeof fields>
        >(table, params, fields, optionals) as unknown as E[],
      update: async (
        params: Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
      ) =>
        this.#update<
          E,
          typeof fields,
          typeof optionals,
          Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
        >(table, params),
      updateMany: async (
        params: Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
      ) =>
        this.#update<
          E,
          typeof fields,
          typeof optionals,
          Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
        >(table, params),
      delete: async (
        params: Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
      ) =>
        this.#delete<
          E,
          typeof fields,
          typeof optionals,
          Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
        >(table, params),
      deleteMany: async (
        params: Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
      ) =>
        this.#delete<
          E,
          typeof fields,
          typeof optionals,
          Omit<ParamsORM<typeof fields, typeof optionals>, 'include'>
        >(table, params),
    }
  }
}
