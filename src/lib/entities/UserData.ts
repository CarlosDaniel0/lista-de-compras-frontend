import { uuidv4 } from "../utils"
import { User } from "../../util/types"

export class UserData implements User {
  id: string
  name: string
  email: string
  picture?: string | undefined
  token?: string | undefined

  constructor(id: string, name: string, email: string, picture?: string, token?: string) {
    this.id = id ?? uuidv4()
    this.name = name
    this.email = email
    this.picture = picture
    this.token = token
  }

  static parse(json: Record<string, string>) {
    const { id, name, email, picture, token } = json
    return new UserData(id, name, email, picture, token)
  }

  toEntity() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      picture: this.picture
    }
  }
}