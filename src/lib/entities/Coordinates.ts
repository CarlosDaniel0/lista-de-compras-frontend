import { uuidv4 } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Coordinates {
  id: string
  lat: number
  long: number
  supermarket_id: string

  constructor (id: string, lat: number, long: number, supermarket_id: string) {
    this.id = id ?? uuidv4();
    this.lat = lat;
    this.long = long;
    this.supermarket_id = supermarket_id
  }

  static parse(json: Record<string, any>) {
    const { id, lat, long, supermarket_id } = json
    return new Coordinates(id, lat, long, supermarket_id )
  }

  toEntity() {
    return {
      id: this.id,
      lat: this.lat, 
      long: this.long,
      supermarket_id: this.supermarket_id
    }
  }

  toBase() {
    return [this.lat, this.long]
  }
}