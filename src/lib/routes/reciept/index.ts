import { APIRouter } from '../../entities/APIRouter'
import { ProductRecieptData } from '../../entities/ProductRecieptData'
import { RecieptData } from '../../entities/RecieptData'
import { SQLite } from '../../entities/SQLite'
import { databaseErrorResponse } from '../../utils'
const router = new APIRouter()

router.get('/', async (_, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const reciepts = await sqlite.reciept.findMany({
      select: { id: true, name: true, date: true, discount: true, total: true, supermarket_id: true, user_id: true },
      where: { removed: false },
    })
    res.send({ status: true, data: { reciepts } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    if (hasLocalHeader) await sqlite.reciept.delete({})
    const content = Array.isArray(req.body) ? req.body : [req.body]
    const data = content.map((item) => RecieptData.parse({ ...item, sync: hasLocalHeader }).toEntity())
    const reciept = await sqlite.reciept.createMany({ data })
    res.send({
      status: true,
      message: 'Comprovante cadastrado com sucesso!',
      data: { reciept },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    if (hasLocalHeader) await sqlite.reciept.delete({})
    const data = RecieptData.parse(req.body).toEntity()
    const reciept = await sqlite.reciept.create({ data })
    res.send({
      status: true,
      message: 'Comprovante cadastrado com sucesso!',
      data: { reciept },
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
    if (hasLocalHeader) await sqlite.reciept.delete({})
    const data = RecieptData.parse({
      ...req.body,
      sync: hasLocalHeader,
    }).toEntity()
    const reciept = await sqlite.reciept.update({ data, where: { id } })
    res.send({
      status: true,
      message: 'Comprovante atualizado com sucesso!',
      data: { reciept },
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
    let reciept
    if (hasLocalHeader) reciept = await sqlite.reciept.delete({ where: { id } })
    else
      reciept = await sqlite.reciept.update({
        data: { removed: true },
        where: { id },
      })
    res.send({
      status: true,
      message: 'Comprovante removido com sucesso!',
      data: { reciept },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id } = req.params
    const reciept = await sqlite.reciept.findUnique({
      where: { id },
      include: { products: true },
    })
    res.send({ status: true, data: { reciept } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: receipt_id } = req.params
    const products = await sqlite.productReciept.findMany({
      select: { id: true, index: true, quantity: true, price: true, total: true, receipt_id: true, product_id: true },
      where: { receipt_id, removed: false },
      include: { product: true }
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
    const { id: receipt_id } = req.params
    const content = (Array.isArray(req.body) ? req.body : [req.body]).map((e) =>
      Object.assign(e, { receipt_id, sync: hasLocalHeader })
    )
    const data = content.map(ProductRecieptData.parse).map((e) => e.toEntity())
    if (hasLocalHeader) await sqlite.productReciept.delete({})
    const product = await sqlite.productReciept.createMany({ data })
    res.send({
      status: true,
      message: 'Produto cadastrado com sucesso!',
      data: { product },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.get('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: receipt_id, id_product: id } = req.params;
    const product = await sqlite.productReciept.findFirst({ where: { id, receipt_id }})
    res.send({ status: true, data: { product } });
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id: receipt_id, id_product: id } = req.params;
    const data = ProductRecieptData.parse({
      ...req.body,
      sync: hasLocalHeader
    }).toEntity()
    const product = await sqlite.productReciept.update({ data, where: { id, receipt_id }})
    res.send({ status: true, message: 'Produto atualizado com sucesso!', data: { product } });
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const hasLocalHeader = req.headers.has('x-chached-by-api')
    const { id: receipt_id, id_product: id } = req.params;
    let product 
    if (hasLocalHeader) 
      product = await sqlite.productReciept.delete({ where: { id, receipt_id }})
    else
      product = await sqlite.productReciept.update({ data: { removed: true }, where: { id, receipt_id }})
    res.send({ status: true, message: 'Produto atualizado com sucesso!', data: { product } });
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

export default router
