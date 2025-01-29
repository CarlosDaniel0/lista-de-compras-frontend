import { request } from "../../util"
import { Product, ProductTypes } from "../../util/types"

export const handleCreateProduct = async <T,>(path: ProductTypes, id: string, data: T) => request<{
  status: boolean
  message: string
  data: { product: Product<typeof path>[] }
}>(
  `/${path}/${id}/products`,
  data,
  'POST'
)