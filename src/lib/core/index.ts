import { ListData } from '../entities/ListData'
import { ProductListData } from '../entities/ProductListData'
import { ProductRecieptData } from '../entities/ProductRecieptData'
import { ProductSupermarketData } from '../entities/ProductSupermarketData'
import { RecieptData } from '../entities/RecieptData'
import { SQLite } from '../entities/SQLite'
import { SupermarketData } from '../entities/SupermarketData'
import { UserData } from '../entities/UserData'
import { API_URL } from '../utils/constants'
import { DataExport } from '../utils/types'

const dataImport = async (channel: BroadcastChannel, user_id: string) => {
  const sqlite = new SQLite(channel)
  try {
    const search = new URLSearchParams()
    search.append('u', user_id)
    const data = await fetch(`${API_URL}/core/export?${search}`)
      .then((res) => res.text())
      .then((res) => {
        let json = {}
        try {
          json = JSON.parse(res)
        } catch (_) {}
        return json as DataExport
      })

    const {
      user,
      lists,
      supermarkets,
      reciepts,
      productList,
      productReciept,
      productSupermarket,
    } = data

    await sqlite.user.create({
      data: UserData.parse(user as Record<string, any>).toEntity(),
    })

    await sqlite.list.createMany({
      data: lists.map(ListData.parse).map((e) => e.toEntity()),
    })

    await sqlite.supermarket.createMany({
      data: supermarkets.map(SupermarketData.parse).map((e) => e.toEntity()),
    })

    await sqlite.reciept.createMany({
      data: reciepts.map(RecieptData.parse).map((e) => e.toEntity()),
    })

    await sqlite.productSupermarket.createMany({
      data: productSupermarket
        .map(ProductSupermarketData.parse)
        .map((e) => e.toEntity()),
    })

    await sqlite.productReciept.createMany({
      data: productReciept
        .map(ProductRecieptData.parse)
        .map((e) => e.toEntity()),
    })

    await sqlite.productList.createMany({
      data: productList.map(ProductListData.parse).map((e) => e.toEntity()),
    })
  } catch (_) {}
}

export const dataExport = (channel: BroadcastChannel, user_id: string) => {
  console.log(channel, user_id)
}

export const messageHandler = (
  channels: { sqlite: BroadcastChannel; worker: BroadcastChannel },
  evt: MessageEvent,
  online: { status: boolean }
) => {
  const { sqlite, worker } = channels
  const { data } = evt
  if ('verifyOnlineStatus' in data) {
    const img = '/icon/android-chrome-192x192.png'
    const req = new Request(img, {
      method: 'HEAD',
    })

    fetch(req)
      .then(() => {
        online.status = true
        sendMessage(worker, { statusonline: true })
      })
      .catch(() => {
        online.status = false
        sendMessage(worker, { statusonline: false })
      })
  }
  if ('status' in data) online.status = data.status
  if ('import' in data && data.user_id) dataImport(sqlite, data.user_id)
  if ('export' in data && data.user_id) dataExport(sqlite, data.user_id)
}

const sendMessage = async (
  channel: BroadcastChannel,
  msg: { statusonline: boolean }
) => {
  channel.postMessage(msg)
}
