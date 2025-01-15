// import { precacheAndRoute } from 'workbox-precaching'
import localAPI from '..'
declare let self: ServiceWorkerGlobalScope
const { VITE_API_URL } = import.meta.env

// precacheAndRoute(self.__WB_MANIFEST)
const online = { status: false }
const channelSQL = new BroadcastChannel('sqlite')
const channelStatus = new BroadcastChannel('status')

channelStatus.addEventListener('message', (evt) => {
  const { data } = evt
  if ('verifyOnlineStatus' in data) {
    const img = '/icon/android-chrome-192x192.png'
    const req = new Request(img, {
      method: 'HEAD',
    })

    fetch(req)
      .then(() => {
        online.status = true
        sendMessage({ statusonline: true })
      })
      .catch(() => {
        online.status = false
        sendMessage({ statusonline: false })
      })
  }
  if ('status' in data) online.status = data.status
})

self.addEventListener('fetch', (evt) => {
  const { url } = evt.request

  evt.respondWith(
    url.includes(VITE_API_URL)
      ? localAPI(evt, channelSQL, online.status)
      : fetch(evt.request)
        .catch((err) => err)
  )
})

const sendMessage = async (msg: { statusonline: boolean }) => {
  channelStatus.postMessage(msg)
}
