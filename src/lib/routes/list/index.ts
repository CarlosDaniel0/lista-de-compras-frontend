import { List } from '../../../util/types'
import { APIRouter } from '../../entities/APIRouter'
import { ListData } from '../../entities/ListData'
import { ProductListData } from '../../entities/ProductListData'
import { SQLite } from '../../entities/SQLite'
import { databaseErrorResponse } from '../../utils'
const router = new APIRouter()

router.get('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { u: user_id } = req.query as never
    const lists = user_id
      ? await sqlite.list.findMany({
          select: { id: true, name: true, date: true, user_id: true },
          where: { removed: false, user_id },
        })
      : null
    res.send({ status: !!user_id, message: !user_id ? 'O parâmetro "u" é obrigatório na requisição' : '', data: { lists } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    if (hasLocalHeader) await sqlite.list.delete({})
    const data: List[] = (Array.isArray(req.body) ? req.body : [req.body]).map(
      (item) => ListData.parse({ ...item, sync: hasLocalHeader }).toEntity()
    )
    const list = await sqlite.list.createMany({ data })
    res.send({
      status: true,
      message: 'Lista Criada com sucesso!',
      data: { list },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id } = req.params
    const data = ListData.parse({
      ...req.body,
      sync: hasLocalHeader,
    }).toEntity()
    const list = await sqlite.list.update({ data, where: { id } })
    res.send({
      status: true,
      message: 'Lista alterada com sucesso!',
      data: { list },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id } = req.params
    let list = null
    if (hasLocalHeader) list = await sqlite.list.delete({ where: { id } })
    else
      list = await sqlite.list.update({
        data: { removed: true },
        where: { id },
      })
    res.send({
      status: true,
      message: 'Lista removida com sucesso!',
      data: { list },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id } = req.params
    const list = await sqlite.list.findUnique({
      where: { id },
      include: { products: true },
    })
    res.send({ status: true, data: { list } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: list_id } = req.params
    const products = await sqlite.productList.findMany({
      select: {
        id: true,
        description: true,
        quantity: true,
        unity: true,
        product_id: true,
        list_id: true,
      },
      where: { list_id, removed: false },
    })
    res.send({ status: true, data: { products } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id: list_id } = req.params
    const content = (Array.isArray(req.body) ? req.body : [req.body]).map((e) =>
      Object.assign(e, { list_id, sync: hasLocalHeader })
    )
    const data = content.map(ProductListData.parse).map((e) => e.toEntity())
    if (hasLocalHeader) await sqlite.productList.delete({})
    const product = await sqlite.productList.createMany({ data })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: list_id, id_product: id } = req.params
    const product = await sqlite.productList.findFirst({
      where: { id, list_id },
      include: { product: true },
    })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id: list_id, id_product: id } = req.params
    const data = ProductListData.parse({
      ...req.body,
      sync: hasLocalHeader,
    }).toEntity()
    const product = await sqlite.productList.update({
      data,
      where: { id, list_id },
    })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id: list_id, id_product: id } = req.params
    let product = null
    if (hasLocalHeader)
      product = await sqlite.productList.delete({ where: { id, list_id } })
    else
      product = await sqlite.productList.update({
        data: { removed: true },
        where: { id, list_id },
      })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

export default router
