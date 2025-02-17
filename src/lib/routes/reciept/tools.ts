import { aggregateByKey, decimalSum, sum } from '../../utils'
import { SQLite } from '../../entities/SQLite'
import { RecieptData } from '../../entities/RecieptData'
import { RecieptImportData } from '../../entities/RecieptImportData'
import { ProductRecieptImportData } from '../../entities/ProductRecieptImportData'
import { CaptureType, XMLProduct } from '../../utils/types'
import { XMLParser } from 'fast-xml-parser'
import { format } from 'date-fns'

const currency = Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const handleImport = async (
  channel: BroadcastChannel,
  rec: RecieptImportData
) => {
  const sqlite = new SQLite(channel)

  const {
    supermarket_id: id,
    products,
    date,
    total,
    discount,
    name,
    user_id,
  } = rec

  const currentReciept = await sqlite.reciept.findFirst({
    where: { 
      discount,
      total,
      date
    }
  })
  if (currentReciept !== null)
    throw new Error(`Comprovante ${currentReciept?.name} encontrado!\nData: ${format(new Date(currentReciept?.date ?? Date.now), 'dd/MM/yyyy')}\nValor: ${currency.format(Number(currentReciept?.total ?? 0))}`)

  const supermarket = await sqlite.supermarket.findFirst({
    where: { id },
    include: { products: true },
  })

  const newProducts = aggregateByKey(products ?? [], 'barcode').map((prod) => ({
    category: '',
    description: prod.description,
    last_update: date,
    price: prod.price,
    supermarket_id: supermarket!.id,
    unity: prod.unity,
    barcode: prod.barcode,
  }))

  const prods = aggregateByKey(supermarket?.products ?? [], 'barcode')
    .map((prod) => {
      const item = newProducts.find((p) => p.barcode === prod.barcode)
      if (item)
        return {
          ...prod,
          category: item.category,
          price: item.price,
          unity: item.unity,
          last_update: date,
        }
      return undefined
    })
    .filter((prod) => typeof prod === 'object')

  const reciept = await sqlite.reciept.create({
    data: {
      name,
      user_id,
      supermarket_id: supermarket!.id,
      total,
      discount,
      date: date,
    },
  })

  if (reciept.id) {
    const supermarketProducts: Record<string, any>[] = prods
    // await sqlite
    //   .$transaction(
    //     prods.map((prod) =>
    //       sqlite.productSupermarket.update({
    //         data: prod,
    //         where: { id: prod.id },
    //       })
    //     )
    //   )
    //   .then(async (res) => {
    //     const insertedProducts =
    //       await sqlite.productSupermarket.createManyAndReturn({
    //         data: newProducts.filter(
    //           (prod) => !res.some((p) => p.barcode === prod.barcode)
    //         ),
    //       });
    //     return res.concat(insertedProducts);
    //   });

    const recipetProducts = (products ?? []).map((prod) => {
      const item = supermarketProducts.find((p) => p.barcode === prod.barcode)
      return {
        ...prod,
        product_id: item?.id,
        supermarket_id: supermarket?.id,
      }
    })

    const productsReciept = await sqlite.productReciept.createMany({
      data: recipetProducts.map((prod) => ({
        position: prod.position!,
        quantity: prod.quantity!,
        price: prod.price!,
        total: prod.total!,
        discount: prod?.discount ?? 0,
        receipt_id: reciept.id!,
        product_id: prod.product_id!,
      })),
    })

    return RecieptData.parse({ ...reciept, products: productsReciept })
  }
  return null
}

const parseProductsFromXML = async (text: string) => {
  const parser = new XMLParser()
  const xml = parser.parse(text)

  try {
    return (xml.nfeProc.proc.nfeProc.NFe.infNFe.det as XMLProduct[]).map(
      ({ prod }, i) =>
        ({
          position: i + 1,
          description: prod.xProd,
          barcode: prod.cEAN.toString().padStart(14, '0'),
          unity: prod.uCom,
          quantity: prod.qCom,
          discount: prod?.vDesc ?? 0,
          price: prod.vUnCom,
          total: prod.vProd,
        } as ProductRecieptImportData)
    )
  } catch (e) {
    const error = e instanceof Error ? e : { message: '', stack: '', cause: '' }
    console.error(`Error\n${error.message}\ndetail: ${error.stack}`)
    throw new Error(
      'Não foi possível capturar os produtos para o XML fornecido'
    )
  }
}

const parseProductsFromTXT = (text: string) => {
  let index = 0
  const lines = text.split('\n')
  const discounts = Object.fromEntries(
    lines
      .filter((item) => item.includes('Desconto'))
      .map((item) => (item.match(/(\d+)(?:\.(\d+))|(\d+)/g) ?? []).map(Number))
  )
  return lines
    .filter(
      (item) =>
        /(\d+)(?:\.(\d+)|)((?:[A-Z]{2})|)|(?<=(\d{14})(\s)).*|(\d)[A-Z]+/g.test(
          item
        ) && !/[a-z]+/g.test(item)
    )
    .map((item) =>
      item.match(
        /(\d+)(?:\.(\d+)|)((?:[A-Z]{2})|)|(?<=(\d{14})(\s)).*|(\d)[A-Z]+/g
      )
    )
    .reduce((acc, line) => {
      if (!/(\D)/g.test(line?.[0] ?? '0')) {
        index = parseInt(line?.[0] ?? '1') - 1
        acc.push({
          position: index + 1,
          barcode: line?.[1],
          description: line?.[2],
        } as ProductRecieptImportData)
      } else {
        const discount = discounts[index + 1]
        acc[index].quantity = parseFloat(line![0].replace(/[^0-9.]/g, ''))
        acc[index].unity = line![0].replace(/[0-9.]/g, '')
        acc[index].price = parseFloat(line?.[1] ?? '0')
        if (discount) acc[index].discount = discount
        acc[index].total = parseFloat(line?.[2] ?? '0')
      }
      return acc
    }, [] as ProductRecieptImportData[])
}

export const handleProducts = async (
  type: CaptureType,
  file: string | Record<string, never> | Record<string, never>[]
) => {
  if (!file) return { chavenfe: '', products: [], discount: 0, total: 0 }
  const record = typeof file === 'object' ? (file as Record<string, any>) : {}
  let products: ProductRecieptImportData[] = [],
    chavenfe = '',
    discount = 0,
    total = 0
  switch (type) {
    case 'json':
      products = (Array.isArray(file) ? file : record.products).map(
        ProductRecieptImportData.parse
      )
      break
    case 'xml':
      products = await parseProductsFromXML(file + '')
      break
    case 'txt':
      products = parseProductsFromTXT(file + '')
      break
    case 'qrcode':
      throw new Error(
        'Não é possível importar os produtos por QR Code com a aplicação offline'
      )
  }
  discount = sum(products, 'discount')
  total = decimalSum(sum(products, 'total'), -discount)
  return {
    chavenfe,
    products,
    discount,
    total,
  }
}
