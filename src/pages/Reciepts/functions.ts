import { request } from "../../util"
import { Reciept } from "../../util/types"

export const handleCreateReciept = async <T,>(data: T|T[]) => {
  return request<{
    status: boolean
    message: string
    data: { reciept: Reciept[] }
  }>(`/reciepts`, data, 'POST')
}