/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuidv4 } from "../utils";
import { Coordinates } from "./Coordinates";
import { ProductSupermarketData } from "./ProductSupermarketData";
import { RecieptData } from "./RecieptData";

export class SupermarketData implements SupermarketData {
  id: string;
  name: string;
  address: string;
  coords: number[];
  removed: boolean = false;
  sync: boolean = false;
  reciepts?: RecieptData[];
  products?: ProductSupermarketData[];

  constructor(
    id: string,
    name: string,
    address: string,
    coords: number[],
    removed: boolean,
    sync: boolean,
    reciepts?: Record<string, any>[],
    products?: Record<string, any>[]
  ) {
    this.id = id ?? uuidv4();
    this.name = name;
    this.address = address;
    this.coords = typeof coords?.[0] === 'number' ? coords : Coordinates.parse(coords?.[0] ?? {}).toBase();
    if (typeof removed === 'boolean') this.removed = removed;
    if (typeof sync === 'boolean') this.sync = sync;
    if (reciepts) this.reciepts = reciepts?.map(RecieptData.parse);
    if (products) this.products = products?.map(ProductSupermarketData.parse);
  }

  static parse(json: Record<string, any>) {
    const { id, name, address, coords, removed, sync, reciepts, products } = json;
    return new SupermarketData(id, name, address, coords, removed, sync, reciepts, products);
  }

  toEntity() {
    const json = {
      id: this.id,
      name: this.name,
      address: this.address,
      coords: this.coords,
      removed: this.removed,
      sync: this.sync
    };
    return json;
  }

  toBase(coords?: Record<string,any>) {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      coords: Coordinates.parse(coords!).toBase(),
    }
  }
}