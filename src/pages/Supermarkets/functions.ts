import { request } from "../../util"
import { Supermarket } from "../../util/types"

export const handleCreateSupermarket = <T,>(data: T) =>
  request<{
    status: boolean
    message: string
    data: { supermarket: Supermarket[] }
  }>(`/supermarkets`, data, 'POST')