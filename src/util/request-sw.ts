import { precacheAndRoute } from "workbox-precaching"

declare let self: ServiceWorkerGlobalScope
const { API_URL } = import.meta.env

self.addEventListener('fetch', (evt) => {
  if (evt.request.url.includes(API_URL)) {
    console.log(evt.request.url)
    return evt.respondWith(Promise.reject(new  Error('Teste para bloquear todas as requisições')))
  }

  evt.respondWith(fetch(evt.request))
})

precacheAndRoute(self.__WB_MANIFEST)