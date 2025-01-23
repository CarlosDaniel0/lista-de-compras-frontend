export type SetState<T = never> = React.Dispatch<React.SetStateAction<T>>
export interface List {
  id: string
  name: string
  date: string
  user_id: string
  user?: User
  products?: ProductList[]
}

export type ProductTypes = 'lists' | 'supermarkets' | 'reciepts'
export interface ProductList {
  id: string
  description: string
  unity: string
  quantity: number
  list_id: string
  product_id?: string,
  supermarket_id?: string
  product?: ProductSupermarket
  supermarket?: Supermarket
}

export interface User {
  id: string
  name: string
  email: string
  picture?: string
  token?: string
}

export interface ProductReciept {
  id: string
  index: number
  quantity: number
  price: number
  total: number | string
  receipt_id: string
  product_id: string
  receipt?: Reciept
  product?: ProductSupermarket
}

export interface Reciept {
  id: string
  name: string
  date: string
  total: number | string
  discount: number | string
  supermarket_id: string
  supermarket?: Supermarket
  user_id: string
  user?: User
  products?: ProductReciept[]
}

export interface Supermarket {
  id: string
  name: string
  address: string
  coords: number[]
  reciepts?: Reciept[]
  products?: ProductSupermarket[]
}

export interface Wholesale {
  id: string
  description: string
  min_quantity: number
  price: number
  product_id: string
  product?: ProductSupermarket
}

export interface ProductSupermarket {
  id: string
  description: string
  unity: string
  category: string
  barcode?: string
  price: number | string
  last_update: Date
  supermarket_id: string
  wholesale?: Wholesale
  supermarket?: Supermarket
}

export interface Tables {
  id: string
  name: string
  version: string
  sync: boolean
}

interface ProductOption {
  lists: ProductList
  supermarkets: ProductSupermarket
  reciepts: ProductReciept
} 

export type Product <T extends 'lists' | 'supermarkets' |'reciepts'> = ProductOption[T]

export interface ResponseData <T,> {
  status: boolean
  message: string
  data: T
}

export interface Option {
  key: string | number
  label: React.ReactNode
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>, close: () => void) => void
}

export type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
}

export type HTTPMethods = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
export type Permission = 'camera'
export enum CameraStates {
  IDLE,
  REQUESTING,
  NOT_ALLOWED,
  ALLOWED,
}

export interface Config {
  user: Partial<User>,
  token: string,
  isLoggedIn: boolean,
  theme: 'dark' | 'light',
  permissions: Permission[]
}