import { uuidv4 } from "../utils"
import { ProductSupermarket } from "../../util/types"
import { SupermarketData } from "./SupermarketData"
import { WholesaleData } from "./WholesaleData"

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ProductSupermarketData implements ProductSupermarket {
  id: string
  description: string
  unity: string
  category: string
  barcode?: string
  price: number
  removed: boolean = false
  sync: boolean = false;
  last_update: Date
  supermarket_id: string
  wholesale?: WholesaleData
  supermarket?: SupermarketData

  constructor(
    id: string,
    description: string,
    unity: string,
    category: string,
    barcode: string = '',
    price: number,
    removed: boolean,
    sync: boolean,
    last_update: string,
    supermarket_id: string,
    wholesale?: Record<string, any>,
    supermarket?: Record<string, any>
  ) {
    this.id = id ?? uuidv4()
    this.description = description
    this.unity = unity
    this.category = category
    this.barcode = barcode
    this.price = price
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    this.last_update = new Date(last_update)
    this.supermarket_id = supermarket_id
    if (wholesale) this.wholesale = WholesaleData.parse(wholesale)
    if (supermarket) this.supermarket = SupermarketData.parse(supermarket)
  }

  static parse(json: Record<string, any>) {
    const {
      id,
      description,
      unity,
      category,
      barcode,
      price,
      removed,
      sync,
      last_update,
      supermarket_id,
      wholesale,
      supermarket,
    } = json
    return new ProductSupermarketData(
      id,
      description,
      unity,
      category,
      barcode,
      price,
      removed,
      sync,
      last_update,
      supermarket_id,
      wholesale,
      supermarket
    )
  }

  toEntity() {
    const json = {
      id: this.id,
      description: this.description,
      unity: this.unity,
      category: this.category,
      barcode: this.barcode,
      price: this.price,
      last_update: this.last_update,
      supermarket_id: this.supermarket_id,
    }
    return json
  }
}
