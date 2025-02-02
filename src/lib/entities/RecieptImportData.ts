import { ProductRecieptImportData } from "./ProductRecieptImportData";

export class RecieptImportData {
  id: string;
  name: string;
  user_id: string;
  supermarket_id: string;
  date: Date;
  total: number;
  discount: number;
  products?: ProductRecieptImportData[];

  constructor(
    id: string,
    name: string,
    user_id: string,
    supermarket_id: string,
    date: string,
    total: number,
    discount: number,
    products: Record<string, never>[]
  ) {
    this.id = id;
    this.name = name;
    this.user_id = user_id;
    this.supermarket_id = supermarket_id;
    this.date = new Date(date.substring(0, 10) + " 00:00:00");
    this.total = total;
    this.discount = discount;
    if (products) this.products = products.map(ProductRecieptImportData.parse);
  }

  static parse(json: Record<string, never>) {
    const { id, name, user_id, supermarket_id, date, total, discount, products } = json;
    if (!name) throw new Error("name é um campo obrigatório");
    if (!user_id)
      throw new Error("user_id é um campo obrigatório");
    if (!supermarket_id)
      throw new Error("supermarket_id é um campo obrigatório");
    if (!date || !new Date(date))
      throw new Error("date é um campo obrigatório");
    if (!total || Number.isNaN(Number(total)))
      throw new Error("total é um campo obrigatório");

    return new RecieptImportData(
      id,
      name,
      user_id,
      supermarket_id,
      date,
      total,
      discount,
      products
    );
  }

  toEntity() {
    return {
      id: this.id,
      name: this.name,
      user_id: this.user_id,
      supermarket_id: this.supermarket_id,
      date: this.date.toJSON(),
      total: this.total,
      discount: this.discount,
      products: this.products
    }
  }
}
