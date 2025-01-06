export type SetState<T = never> = React.Dispatch<React.SetStateAction<T>>
export interface List {
  id: string
  name: string
  date: string
  user_id: string
  user?: User
  products?: ProductList[]
}

export interface ProductList {
  id: string
  description: string
  unity: string
  quantity: number
  list_id: string
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  token?: string
}