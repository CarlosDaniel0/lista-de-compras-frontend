import { uuidv4 } from "../utils"

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TablesData {
  id: string
  name: string
  version: string
  sync = false

  constructor (id: string, name: string, version: string, sync: boolean) {
    this.id = id ?? uuidv4()
    this.name = name
    this.version = version
    if (typeof sync === 'boolean') this.sync = sync
  }

  static parse(json: Record<string, any>) {
    const { id, name, version, sync } = json
    return new TablesData(id, name, version, sync)
  }

  toEntity() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      sync: this.sync
    }
  }
}