/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from '../utils'
import { ProductReciept } from '../../util/types'
import { ProductSupermarketData } from './ProductSupermarketData'
import { RecieptData } from './RecieptData'

export class ProductRecieptData implements ProductReciept {
  id: string
  position: number
  quantity: number
  price: number
  total: number
  discount: number = 0
  removed: boolean = false
  sync: boolean = false
  receipt_id: string
  product_id: string
  receipt?: RecieptData
  product?: ProductSupermarketData

  constructor(
    id: string,
    position: number,
    quantity: number,
    price: number,
    total: number,
    discount: number,
    removed: boolean,
    sync: boolean,
    receipt_id: string,
    product_id: string,
    receipt?: Record<string, any>,
    product?: Record<string, any>
  ) {
    this.id = id ?? uuidv4()
    this.position = position
    this.quantity = quantity
    this.price = price
    this.total = total
    if (discount) this.discount = discount
    if (typeof removed === 'boolean') this.removed = removed
    if (typeof sync === 'boolean') this.sync = sync
    this.receipt_id = receipt_id
    this.product_id = product_id
    if (receipt) this.receipt = RecieptData.parse(receipt)
    if (product) this.product = ProductSupermarketData.parse(product)
  }

  static parse(json: Record<string, any>) {
    const {
      id,
      position,
      quantity,
      price,
      total,
      discount,
      removed,
      sync,
      receipt_id,
      product_id,
      receipt,
      product,
    } = json
    return new ProductRecieptData(
      id,
      position,
      quantity,
      price,
      total,
      discount,
      removed,
      sync,
      receipt_id,
      product_id,
      receipt,
      product
    )
  }

  toEntity() {
    const json = {
      id: this.id,
      position: this.position,
      quantity: this.quantity,
      price: this.price,
      total: this.total,
      discount: this.discount,
      removed: this.removed,
      sync: this.sync,
      receipt_id: this.receipt_id,
      product_id: this.product_id,
    }
    return json
  }
}
