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

const dataImport = async (
  sql: BroadcastChannel,
  worker: BroadcastChannel,
  user_id: string
) => {
  const sqlite = new SQLite(sql)
  try {
    const search = new URLSearchParams()
    search.append('u', user_id)
    sendMessage(worker, { progress: 0 })
    const data = await fetch(`${API_URL}/core/export?${search}`)
      .then((res) => res.text())
      .then((res) => {
        let json = {}
        try {
          json = JSON.parse(res)
        } catch (_) {}
        return json as DataExport
      })

    sendMessage(worker, { progress: 50 })
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

    sendMessage(worker, { progress: 58 })
    if (lists.length) {
      const localLists = await sqlite.list.findMany({})
      const list = lists
        .filter((list) => !localLists.some((l) => l.id === list.id))
        .map(ListData.parse)
        .map((e) => e.toEntity())
      const removed = localLists.filter(
        (list) => !supermarkets.some((l) => l.id === list.id)
      )
      if (removed.length)
        await sqlite.list.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (list.length)
        await sqlite.list.createMany({
          data: list,
        })
    }
    sendMessage(worker, { progress: 65 })
    if (supermarkets.length) {
      const localSupermarkets = await sqlite.supermarket.findMany({})
      const list = supermarkets
        .filter(
          (supermarket) =>
            !localSupermarkets.some((s) => s.id === supermarket.id)
        )
        .map(SupermarketData.parse)
        .map((e) => e.toEntity())
      const removed = localSupermarkets.filter(
        (supermarket) => !supermarkets.some((s) => s.id === supermarket.id)
      )
      if (removed.length)
        await sqlite.supermarket.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (list.length) await sqlite.supermarket.createMany({ data: list })
    }

    sendMessage(worker, { progress: 72 })
    if (reciepts.length) {
      const localReciepts = await sqlite.reciept.findMany({})
      const list = reciepts
        .filter((reciept) => !localReciepts.some((r) => r.id === reciept.id))
        .map(RecieptData.parse)
        .map((e) => e.toEntity())
      const removed = localReciepts.filter(
        (reciept) => !reciepts.some((r) => r.id === reciept.id)
      )
      if (removed.length)
        await sqlite.reciept.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (list.length) await sqlite.reciept.createMany({ data: list })
    }

    sendMessage(worker, { progress: 79 })
    if (productSupermarket.length) {
      const localProductSupermarket = await sqlite.productSupermarket.findMany(
        {}
      )
      const list = productSupermarket
        .filter(
          (product) => !localProductSupermarket.some((p) => p.id === product.id)
        )
        .map(ProductSupermarketData.parse)
        .map((e) => e.toEntity())
      const removed = localProductSupermarket.filter(
        (product) => !productSupermarket.some((p) => p.id === product.id)
      )
      if (removed.length)
        await sqlite.productSupermarket.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (lists.length)
        await sqlite.productSupermarket.createMany({ data: list })
    }

    sendMessage(worker, { progress: 79 })
    if (productReciept.length) {
      const localProductReciept = await sqlite.productReciept.findMany({})
      const list = productReciept
        .filter(
          (product) => !localProductReciept.some((p) => p.id === product.id)
        )
        .map(ProductRecieptData.parse)
        .map((e) => e.toEntity())
      const removed = localProductReciept.filter(
        (product) => !productReciept.some((p) => p.id === product.id)
      )
      if (removed.length)
        await sqlite.productReciept.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (list.length) await sqlite.productReciept.createMany({ data: list })
    }

    sendMessage(worker, { progress: 86 })
    if (productList.length) {
      const localProductList = await sqlite.productList.findMany({})
      const list = productList
        .filter((product) => !localProductList.some((p) => p.id === product.id))
        .map(ProductListData.parse)
        .map((e) => e.toEntity())
      const removed = localProductList.filter(
        (product) => !productList.some((p) => p.id === product.id)
      )
      if (removed.length)
        await sqlite.productList.deleteMany({
          where: { id: { in: removed.map((r) => r.id) } },
        })
      if (lists.length)
        await sqlite.productList.createMany({
          data: list,
        })
    }

    sendMessage(worker, { progress: 100, finish: true })
  } catch (_) {}
}

export const dataExport = (
  sql: BroadcastChannel,
  worker: BroadcastChannel,
  user_id: string
) => {
  console.log(sql, worker, user_id)
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
  if ('import' in data && data.user_id) dataImport(sqlite, worker, data.user_id)
  if ('export' in data && data.user_id) dataExport(sqlite, worker, data.user_id)
}

const sendMessage = async <T>(channel: BroadcastChannel, msg: T) => {
  channel.postMessage(msg)
}
