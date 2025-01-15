/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { List, ProductList, User } from "../../util/types";
import { ProductListData } from "./ProductListData";
import { UserData } from "./UserData";

export class ListData implements List {
  id: string;
  name: string;
  date: string;
  removed: boolean = false;
  sync: boolean = false;
  user_id: string
  user?: User
  products?: ProductList[];

  constructor(id: string, name: string, date: string, removed: boolean, sync: boolean, user_id: string, user: Record<string, string>, products?: Record<string, string>[]) {
    this.id = id ?? uuidv4();
    this.name = name;
    this.date = date;
    this.user_id = user_id
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    if (user) this.user = UserData.parse(user)
    if (products) this.products = products?.map(ProductListData.parse)
  }

  static parse(json: Record<string, any>) {
    const { id, name, date, removed, sync, user_id, user, products } = json;
    if (!name) throw new Error("O campo name é obrigatório");
    if (!date || !new Date(date.substring(0, 10) + " 00:00:00"))
      throw new Error("O campo date é obrigatório");
    return new ListData(id, name, date, removed, sync, user_id, user, products);
  }

  toEntity() {
    const json = {
      id: this.id,
      name: this.name,
      date: this.date,
      removed: this.removed,
      sync: this.sync,
      user_id: this.user_id
    };
    return json;
  }
}