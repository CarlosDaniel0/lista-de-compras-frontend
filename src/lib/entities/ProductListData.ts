/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { ProductList } from "../../util/types";
import { ListData } from "./ListData";
import { ProductSupermarketData } from "./ProductSupermarketData";

export class ProductListData implements ProductList {
  id: string;
  description: string;
  unity: string;
  quantity: number;
  removed: boolean = false;
  sync: boolean = false;
  list_id: string;
  product_id?: string;
  list?: ListData;
  product?: ProductSupermarketData;

  constructor(
    id: string,
    description: string,
    unity: string,
    quantity: number,
    removed: boolean,
    sync: boolean,
    list_id: string,
    product_id?: string,
    list?: Record<string, any>,
    product?: Record<string, any>
  ) {
    this.id = id ?? uuidv4();
    this.description = description;
    this.unity = unity;
    this.quantity = quantity;
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    this.list_id = list_id;
    if (product_id) this.product_id = product_id;
    if (list) this.list = ListData.parse(list);
    if (product) this.product = ProductSupermarketData.parse(product);
  }

  static parse(json: Record<string, any>) {
    const { id, description, unity, quantity, removed, sync, list_id, product_id, list, product } = json;
    return new ProductListData(id, description, unity, quantity, removed, sync, list_id, product_id, list, product);
  }

  toEntity() {
    const json = {
      id: this.id,
      description: this.description,
      unity: this.unity,
      quantity: this.quantity,
      removed: this.removed,
      sync: this.sync,
      list_id: this.list_id,
      product_id: this.product_id
    };

    return json;
  }
}