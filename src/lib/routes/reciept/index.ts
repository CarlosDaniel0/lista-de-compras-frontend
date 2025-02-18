import { APIRouter } from '../../entities/APIRouter'
import { ProductRecieptData } from '../../entities/ProductRecieptData'
import { RecieptData } from '../../entities/RecieptData'
import { RecieptImportData } from '../../entities/RecieptImportData'
import { SQLite } from '../../entities/SQLite'
import { databaseErrorResponse } from '../../utils'
import { CaptureType } from '../../utils/types'
import { handleImport, handleProducts } from './tools'
const router = new APIRouter()

router.get('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { u: user_id } = req.query as never
    const reciepts = user_id
      ? await sqlite.reciept.findMany({
          select: {
            id: true,
            name: true,
            date: true,
            discount: true,
            total: true,
            supermarket_id: true,
            user_id: true,
          },
          where: { removed: false, user_id },
        })
      : null
    res.send({
      status: !!user_id,
      message: !user_id ? 'O parâmetro "u" é obrigatório na requisição' : '',
      data: { reciepts },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const content = Array.isArray(req.body) ? req.body : [req.body]
    const data = content.map((item) =>
      RecieptData.parse({ ...item, sync: false }).toEntity()
    )
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

router.post('/products/capture/:type', async (req, res) => {
  try {
    const { type: t } = req.params
    const type = t as CaptureType
    const { products, chavenfe, discount, total } = await handleProducts(type, req.body.content)
    res.send({
      status: !!type,
      message:
        !type
          ? 'O parâmetro :type é obrigatório na requisição'
          : 'Produtos importados com sucesso!',
      data: {
          ...(chavenfe ? { chavenfe } : {}),
          discount,
          total,
          products,
        },
    })
  } catch (e: any) {
    res.send(databaseErrorResponse(e?.message ?? ''))
  }
})

router.post('/import', async (req, res, channel) => {
  try {
    const content = RecieptImportData.parse(req.body)
    const reciept = await handleImport(channel, content)
    res.send({
      status: true,
      message: 'Comprovante importado com sucesso!',
      data: { reciept },
    })
  } catch (e: any) {
    res.send(databaseErrorResponse(e?.message ?? ''))
  }
})

router.post('/:id', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
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
    const { id } = req.params
    const data = RecieptData.parse({
      ...req.body,
      sync: false,
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
    const { id } = req.params
    const reciept = await sqlite.reciept.update({
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
      select: {
        id: true,
        position: true,
        quantity: true,
        price: true,
        total: true,
        receipt_id: true,
        product_id: true,
      },
      where: { receipt_id, removed: false },
      include: { product: true },
    })
    res.send({ status: true, data: { products } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.post('/:id/products', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: receipt_id } = req.params
    const content = (Array.isArray(req.body) ? req.body : [req.body]).map((e) =>
      Object.assign(e, { receipt_id, sync: false })
    )
    const data = content.map(ProductRecieptData.parse).map((e) => e.toEntity())
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
    const { id: receipt_id, id_product: id } = req.params
    const product = await sqlite.productReciept.findFirst({
      where: { id, receipt_id },
    })
    res.send({ status: true, data: { product } })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.put('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: receipt_id, id_product: id } = req.params
    const data = ProductRecieptData.parse({
      ...req.body,
      sync: false,
    }).toEntity()
    const product = await sqlite.productReciept.update({
      data,
      where: { id, receipt_id },
    })
    res.send({
      status: true,
      message: 'Produto atualizado com sucesso!',
      data: { product },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

router.delete('/:id/products/:id_product', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const { id: receipt_id, id_product: id } = req.params
    const product = await sqlite.productReciept.update({
        data: { removed: true },
        where: { id, receipt_id },
      })
    res.send({
      status: true,
      message: 'Produto atualizado com sucesso!',
      data: { product },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

export default router
