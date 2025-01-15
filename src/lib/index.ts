import { API } from "./entities/API"
import router from "./routes"

export default async function localAPI (evt: FetchEvent, channel: BroadcastChannel, status: boolean) {
  const api = new API(channel, status)
  api.use(router)
  return await api.handle(evt)
}