/* eslint-disable @typescript-eslint/no-unused-vars */
import { Supermarket } from '../../../util/types'
import { APIRouter } from '../../entities/APIRouter'
import { Coordinates } from '../../entities/Coordinates'
import { ProductSupermarketData } from '../../entities/ProductSupermarketData'
import { SQLite } from '../../entities/SQLite'
import { SupermarketData } from '../../entities/SupermarketData'
import { databaseErrorResponse } from '../../utils'
const router = new APIRouter()

const format = (item: Supermarket, coords: Coordinates[]) =>
  SupermarketData.parse(item).toBase(
    coords.find((c) => c.supermarket_id === item.id)
  )

router.get('/', async (_, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const supermarkets = await sqlite.supermarket
      .findMany({
        select: { address: true, id: true, name: true },
        where: { removed: false },
        include: { coords: true },
      })
      .then((res) => res.map(SupermarketData.parse))
    res.send({ status: true, data: { supermarkets } })
  } catch (e) {
    if (e instanceof Error) {
      console.log(`cause: ${e.name}`)
      console.log(`message: ${e.message}`)
      console.log(`stack: ${e.stack ?? 'no stack'}`)
    }
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const content = Array.isArray(req.body) ? req.body : [req.body]
    const data = content.map((item) =>
      SupermarketData.parse({ ...item, sync: false }).toEntity()
    )
    const dataCoords = data.map((item) =>
      Coordinates.parse({
        lat: item.coords[0],
        long: item.coords[1],
        supermarket_id: item.id,
      }).toEntity()
    )
    const coords = await sqlite.coords.createMany({ data: dataCoords })
    const supermarket = await sqlite.supermarket
      .createMany({ data: data.map(({ coords, ...rest }) => ({ ...rest })) })
      .then((res) =>
        (Array.isArray(res) ? res : []).map((s) => format(s, coords))
      )

    res.send({
      status: true,
      data: {
        supermarket,
      },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id } = req.params
    const data = SupermarketData.parse({
      ...req.body,
      sync: false,
    }).toEntity()
    const supermarket = await sqlite.supermarket.update({ data, where: { id } })
    res.send({
      status: true,
      message: 'Supermercado atualizado com sucesso!',
      data: { supermarket },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id } = req.params
    const supermarket = await sqlite.supermarket.update({
        data: { removed: true },
        where: { id },
      })
    res.send({
      status: true,
      message: 'Supermercado atualizado com sucesso!',
      data: { supermarket },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const content = Array.isArray(req.body) ? req.body : [req.body]
    const data = content.map((item) =>
      SupermarketData.parse({ ...item, sync: false }).toEntity()
    )
    const dataCoords = data.map((item) =>
      Coordinates.parse({
        lat: item.coords[0],
        long: item.coords[1],
        supermarket_id: item.id,
      }).toEntity()
    )
    const coords = await sqlite.coords.createMany({ data: dataCoords })
    const supermarket = await sqlite.supermarket
      .createMany({ data: data.map(({ coords, ...rest }) => ({ ...rest })) })
      .then((res) =>
        (Array.isArray(res) ? res : []).map((s) => format(s, coords))
      )
    res.send({ status: true, data: { supermarket } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id } = req.params
    const supermarket = await sqlite.supermarket
      .findUnique({
        where: { id },
        include: { coords: true, products: true },
      })
      .then((res) => SupermarketData.parse(res))
    res.send({ status: true, data: { supermarket } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: supermarket_id } = req.params
    const products = await sqlite.productSupermarket.findMany({
      select: {
        id: true,
        description: true,
        barcode: true,
        category: true,
        unity: true,
        price: true,
        last_update: true,
        supermarket_id: true,
      },
      where: { supermarket_id },
    })
    res.send({ status: true, data: { products } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: supermarket_id } = req.params
    const content = (Array.isArray(req.body) ? req.body : [req.body]).map(
      (item) => Object.assign(item, { supermarket_id, sync: false })
    )
    const data = content
      .map(ProductSupermarketData.parse)
      .map((e) => e.toEntity())
    const products = await sqlite.productSupermarket.createMany({ data })
    res.send({ status: true, data: { products } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: supermarket_id, id_product: id } = req.params
    const data = ProductSupermarketData.parse({
      ...req.body,
      id,
      supermarket_id,
      sync: false,
    }).toEntity()
    const product = await sqlite.productSupermarket.create({
      data,
    })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)

  try {
    const { id: supermarket_id, id_product: id } = req.params
    const product = await sqlite.productSupermarket.findFirst({
      where: { supermarket_id, id },
    })
    const rest = product ? { data: { product } } : {}
    res.send({
      status: true,
      message: product
        ? 'Produto encontrado na base de dados'
        : 'Produto não encontrado na base de dados',
      ...rest,
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: supermarket_id, id_product: id } = req.params
    const data = ProductSupermarketData.parse({
      ...req.body,
      sync: false,
    }).toEntity()
    const product = await sqlite.productSupermarket.update({
      data,
      where: { id, supermarket_id },
    })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: supermarket_id, id_product: id } = req.params
    const product = await sqlite.productSupermarket.update({
        data: { removed: true },
        where: { id, supermarket_id },
      })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products/barcode/:barcode', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { barcode } = req.params
    const product = await sqlite.productSupermarket.findFirst({
      where: { barcode: { contains: barcode } },
    })
    const rest = product ? { data: { product } } : {}
    res.send({
      status: !!product,
      message: product
        ? 'Produto encontrado na base de dados'
        : 'Produto não encontrado na base de dados',
      ...rest,
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

export default router
