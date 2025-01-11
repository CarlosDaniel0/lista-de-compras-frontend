import { APIResponse, formatParams } from '../utils'
import { APIRouter, APIRoutes } from './APIRouter'

export class API {
  routes: APIRoutes = {}

  use(router: APIRouter) {
    this.routes = router.routes
  }

  handle(evt: FetchEvent) {
    const { pathname, search } = new URL(evt.request.url)
    return this.routes[pathname]({ ...evt.request, params: formatParams(search) }, APIResponse)
  }
}
