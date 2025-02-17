import localAPI from '..'
import { messageHandler } from '../core'
declare let self: ServiceWorkerGlobalScope
const { VITE_API_URL } = import.meta.env
const online = { status: false }
const channelSQL = new BroadcastChannel('sqlite')
const channelWorker = new BroadcastChannel('worker')

const db = { started: false }
channelWorker.addEventListener('message', (evt) =>
  messageHandler({ sqlite: channelSQL, worker: channelWorker }, evt, online)
)

channelSQL.addEventListener('message', (evt) => {
  const { data } = evt
  if (typeof data === 'object' && 'status' in data) db.started = data.status
})

self.addEventListener('fetch', (evt) => {
  const { url } = evt.request
  if (url.includes(VITE_API_URL) && db.started)
    evt.respondWith(localAPI(evt, channelSQL, online.status))
})
