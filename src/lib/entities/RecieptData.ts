/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { Reciept } from "../../util/types";
import { ProductRecieptData } from "./ProductRecieptData";
import { SupermarketData } from "./SupermarketData";
import { UserData } from "./UserData";

export class RecieptData implements Reciept {
  id: string;
  name: string;
  date: string;
  total: number;
  discount: number;
  removed: boolean = false;
  sync: boolean = false;
  supermarket_id: string;
  supermarket?: SupermarketData;
  user_id: string
  user?: UserData
  products?: ProductRecieptData[];
  

  constructor(
    id: string,
    name: string,
    date: string,
    total: number,
    discount: number,
    removed: boolean,
    sync: boolean,
    supermarket_id: string,
    user_id: string,
    user?: Record<string, any>,
    supermarket?: Record<string, any>,
    products?: Record<string, any>[]
  ) {
    this.id = id ?? uuidv4();
    this.name = name;
    this.date = date;
    this.total = total;
    this.discount = discount;
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    this.supermarket_id = supermarket_id;
    this.user_id = user_id
    if (user) this.user = UserData.parse(user)
    if (supermarket) this.supermarket = SupermarketData.parse(supermarket)
    if (products) this.products = products?.map(ProductRecieptData.parse)
  }

  static parse(json: Record<string, any>) {
    const { id, name, date, total, discount, removed, sync, supermarket_id, user_id, user, supermarket, products } = json;
    return new RecieptData(id, name, date, total, discount, removed, sync, supermarket_id, user_id, user, supermarket, products);
  }

  toEntity() {
    const json = {
      id: this.id,
      name: this.name,
      date: this.date,
      total: this.total,
      removed: this.removed,
      sync: this.sync,
      discount: this.discount,
      supermarket_id: this.supermarket_id,
      user_id: this.user_id
    };
    return json;
  }
}