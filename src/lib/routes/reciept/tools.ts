import { aggregateByKey, decimalSum } from '../../utils'
import { SQLite } from '../../entities/SQLite'
import { RecieptData } from '../../entities/RecieptData'
import { RecieptImportData } from '../../entities/RecieptImportData'
import { ProductRecieptImportData } from '../../entities/ProductRecieptImportData'
import { CaptureType } from '../../utils/types'

export const handleImport = async (
  channel: BroadcastChannel,
  rec: RecieptImportData
) => {
  const sqlite = new SQLite(channel)

  const { supermarket_id: id, products, date, total, discount, name, user_id } = rec

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
        acc[index].total = +(acc[index].quantity * acc[index].price).toFixed(2)
      }
      return acc
    }, [] as ProductRecieptImportData[])
}

export const handleProducts = async (
  type: CaptureType,
  file: string | Record<string, never> | Record<string, never>[]
) => {
  let products: ProductRecieptImportData[] = [],
    chavenfe = ''
  switch (type) {
    case 'json':
      products = (
        Array.isArray(file) ? file : (file as Record<string, any>).products
      ).map(ProductRecieptImportData.parse)
      break
    case 'txt':
      products = parseProductsFromTXT(file + '')
      break
    case 'qrcode':
      throw new Error(
        'Não é possível importar os produtos por QR Code com a aplicação offline'
      )
  }
  return { products, chavenfe }
}
