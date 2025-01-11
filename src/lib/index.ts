import { API } from "./entities/API"
import router from "./routes"

export default function localAPI (evt: FetchEvent) {
  const api = new API()
  api.use(router)
  return api.handle(evt)
}