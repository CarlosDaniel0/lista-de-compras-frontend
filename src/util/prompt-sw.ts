import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import '../lib/database/worker'

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

declare let self: ServiceWorkerGlobalScope
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

// clean old assets
cleanupOutdatedCaches()

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))