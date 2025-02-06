import { defineConfig, PluginOption } from 'vite'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import replace, { RollupReplaceOptions } from '@rollup/plugin-replace'

const isDEV = process.env.NODE_ENV === 'development'
const workerLibs = ['strnum', 'fast-xml-parser']
const options: Partial<VitePWAOptions> = {
  mode: isDEV ? 'development' : 'production',
  base: '/',
  includeAssets: [
    '/icon/*',
    '/img/*',
    'browserconfig.xml',
    'safari-pinned-tab.svg',
  ],
  devOptions: {
    suppressWarnings: true,
    enabled: process.env.SW_DEV === 'true',
    type: 'module',
    navigateFallback: 'index.html',
  },
  manifest: {
    display: 'standalone',
    start_url: '/',
    name: 'Lista de Compras',
    short_name: 'Lista de Compras',
    description: 'Lista de Compras com um toque a mais',
    theme_color: '#ffffff',
    launch_handler: {
      client_mode: 'auto'
    },
    dir: 'ltr',
    prefer_related_applications: false,
    categories: ['supermarket', 'notes', 'products', 'utilites'],
    orientation: 'natural',
    icons: [
      {
        src: '/icon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/assets/screenshot1.webp',
        sizes: '1920x1080',
        type: 'image/webp',
        form_factor: 'wide',
        label: 'App Desktop',
      },
      {
        src: '/assets/screenshot2.webp',
        sizes: '351x694',
        type: 'image/webp',
        label: 'App Mobile',
      },
    ],
  },
}

const replaceOptions: RollupReplaceOptions = {
  preventAssignment: true,
}
const claims = process.env.CLAIMS === 'true'
const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (isDEV) {
  options.injectRegister = 'script'
  options.srcDir = 'src/util'
  options.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
  options.strategies = 'injectManifest'
  options.injectManifest = {
    minify: false,
    enableWorkboxModulesLogs: true,
  }
} else {
  options.workbox = { importScripts: ['/service-worker.js'] }
}

if (claims) options.registerType = 'autoUpdate'

if (reload) {
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying) options.selfDestroying = selfDestroying

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(options), replace(replaceOptions) as PluginOption],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@jlongster_sql', 'absurd-sql'],
  },
  assetsInclude: ["**/*.sql"],
  build: {
    rollupOptions: {
      input: {
        app: './index.html',
        'service-worker': './src/lib/database/worker.ts',
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'service-worker'
            ? '[name].js'
            : 'assets/js/[name]-[hash].js'
        },
        manualChunks(id) {
          if (
            id.includes('node_modules') &&
            !workerLibs.some((key) => id.includes(key))
          ) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }
        },
      },
    },
  },
})
