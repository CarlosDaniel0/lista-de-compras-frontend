/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { Wholesale } from "../../util/types";
import { ProductSupermarketData } from "./ProductSupermarketData";

export class WholesaleData implements Wholesale {
  id: string;
  description: string;
  min_quantity: number;
  price: number;
  removed: boolean = false;
  sync: boolean = false;
  product_id: string;
  product?: ProductSupermarketData;

  constructor(
    id: string,
    description: string,
    min_quantity: number,
    price: number,
    removed: boolean,
    sync: boolean,
    product_id: string,
    product?: Record<string, any>
  ) {
    this.id = id ?? uuidv4();
    this.description = description;
    this.min_quantity = min_quantity;
    this.price = price;
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    this.product_id = product_id;
    if (product) this.product = ProductSupermarketData.parse(product)
  }

  static parse(json: Record<string, any>) {
    const { id, description, min_quantity, price, removed, sync, product_id, product } = json
    return new WholesaleData(id, description, min_quantity, price, removed, sync, product_id, product)
  }

  toEntity() {
    const json = {
      id: this.id,
      description: this.description,
      min_quantity: this.min_quantity,
      price: this.price,
      removed: this.removed,
      sync: this.sync,
      product_id: this.product_id,
    };
    return json;
  }
}