import { version } from '../../package.json'
export const DEBUG = import.meta.env.DEV
export const API_URL = import.meta.env.VITE_API_URL
export const MAX_REQUEST_TIMEOUT = 2 * 60 * 1000
export const online = { status: 'onLine' in navigator && navigator.onLine }
export const VERSION = version
