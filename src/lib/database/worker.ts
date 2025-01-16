import localAPI from '..'
declare let self: ServiceWorkerGlobalScope
const { VITE_API_URL } = import.meta.env
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

  if (url.includes(VITE_API_URL))
  evt.respondWith(localAPI(evt, channelSQL, online.status))
})

const sendMessage = async (msg: { statusonline: boolean }) => {
  channelStatus.postMessage(msg)
}
