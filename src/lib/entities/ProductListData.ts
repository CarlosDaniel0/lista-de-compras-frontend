/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { ProductList } from "../../util/types";
import { ListData } from "./ListData";
import { ProductSupermarketData } from "./ProductSupermarketData";
import { SupermarketData } from "./SupermarketData";

export class ProductListData implements ProductList {
  id: string;
  description: string;
  unity: string;
  quantity: number;
  removed: boolean = false;
  sync: boolean = false;
  list_id: string;
  price?: number;
  registered_product?: boolean
  product_id?: string;
  supermarket_id?: string;
  list?: ListData;
  product?: ProductSupermarketData;
  supermarket?: SupermarketData;

  constructor(
    id: string,
    description: string,
    unity: string,
    quantity: number,
    removed: boolean,
    sync: boolean,
    list_id: string,
    price?: number,
    registered_product?: boolean,
    product_id?: string,
    supermarket_id?: string,
    list?: Record<string, any>,
    product?: Record<string, any>,
    supermarket?: Record<string, any>,
  ) {
    this.id = id ?? uuidv4();
    this.description = description;
    this.unity = unity;
    this.quantity = quantity;
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    this.list_id = list_id;
    this.price = price;
    this.registered_product = registered_product;
    if (product_id) this.product_id = product_id;
    if (supermarket_id) this.supermarket_id = supermarket_id;
    if (list) this.list = ListData.parse(list);
    if (product) this.product = ProductSupermarketData.parse(product);
    if (supermarket) this.supermarket = SupermarketData.parse(supermarket);
  }

  static parse(json: Record<string, any>) {
    const { id, description, unity, quantity, removed, sync, list_id, price, registered_product, product_id, supermarket_id, list, product, supermarket } = json;
    return new ProductListData(id, description, unity, quantity, removed, sync, list_id, price, registered_product, product_id, supermarket_id, list, product, supermarket);
  }

  toEntity() {
    const json = {
      id: this.id,
      description: this.description,
      unity: this.unity,
      quantity: this.quantity,
      price: this.price,
      registered_product: this.registered_product,
      removed: this.removed,
      sync: this.sync,
      list_id: this.list_id,
      product_id: this.product_id,
      supermarket_id: this.supermarket_id,
    };

    return json;
  }
}