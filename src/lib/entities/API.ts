import { HTTPMethods } from '../../util/types'
import { formatParams } from '../utils'
import { APIResponse } from './APIResponse'
import { APIRouter, APIRoutes } from './APIRouter'

const methods: Record<string, string> = {
  GET: 'POST',
  POST: 'POST',
  DELETE: 'DELETE',
  PUT: 'PUT',
  PATCH: 'PATCH',
}
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
      params: formatParams(search),
    }

    await this.routes[pathname][method](req, res, this.channel)
    if (res.response) return res.response
    return Promise.reject(new Error('No response for method'))
  }

  async handle(evt: FetchEvent) {
    const { request } = evt
    const clone = request.clone()

    try {
      if (!this.status) return this.#exec(request)
      const res = await fetch(request)
      if (['HEAD'].includes(request.method)) return res
      await res
        .clone()
        .json()
        .then((res) => {
          if (res.status) {
            const headers = new Headers()
            headers.append('X-Chached-By-API', 'true')
            this.#exec(
              new Request(clone, {
                headers,
                method: methods[request.method],
                body: JSON.stringify(
                  Array.isArray(res.data)
                    ? res.data
                    : Object.values(res.data)[0]
                ),
              })
            )
          }
        })
      return res
    } catch (_) {
      return this.#exec(clone)
    }
  }
}
