import { HTTPMethods } from '../../util/types'
import { formatParams, formatQueryParams } from '../utils'
import { APIResponse } from './APIResponse'
import { APIRouter, APIRoutes } from './APIRouter'

export class API {
  private readonly status
  private readonly channel
  constructor(channel: BroadcastChannel, status: boolean) {
    this.channel = channel
    this.status = status
  }
  routes: APIRoutes = {}

  use(router: APIRouter) {
    this.routes = router.routes
  }

  async #exec(request: Request) {
    const { pathname, search } = new URL(request.url)
    const method = request.method as HTTPMethods
    const res = new APIResponse()
    const body = !['GET', 'HEAD'].includes(method) ? await request.json() : null
    const [path, params] = formatParams(pathname, Object.keys(this.routes))
    const req = {
      ...request,
      bodyUsed: request.bodyUsed,
      credentials: request.credentials,
      destination: request.destination,
      keepalive: request.keepalive,
      integrity: request.integrity,
      method: request.method,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      signal: request.signal,
      url: request.url,
      cache: request.cache,
      headers: request.headers,
      body,
      params,
      query: formatQueryParams(search)
    }
    await this.routes[path]?.[method]?.(req, res, this.channel)
    if (res.response) return res.response
    return Promise.reject(new Error(`No response for method for ${method}:${path}`))
  }

  async handle(evt: FetchEvent) {
    const { request } = evt
    const clone = request.clone()

    try {
      if (!this.status) return this.#exec(request)
      return await fetch(request)
    } catch (_) {
      return this.#exec(clone)
    }
  }
}
