export class ProductRecieptImportData {
  position: number
  barcode: string
  description: string
  quantity: number
  unity: string
  price: number
  discount: number
  total: number

  constructor (position: number, barcode: string, description: string, quantity: number, unity: string, price: number, discount: number) {
    this.position = position
    this.barcode = barcode
    this.description = description
    this.quantity = quantity
    this.unity = unity
    this.price = price
    this.discount = discount ?? 0
    this.total = +(quantity * price).toFixed(2)
  }

  static parse(json: Record<string, any>) {
    const { position, barcode, description, quantity, unity, price, discount } = json
    return new ProductRecieptImportData(position, barcode, description, quantity, unity, price, discount)
  }
}