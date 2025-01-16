import { HTTPMethods } from "../../util/types"
import { CallbackAPI, QueryParameters, RouteParameters } from "../utils/types"

type MethodRoute = { [method in HTTPMethods]: CallbackAPI  } 
export type APIRoutes = { [key: string]: MethodRoute }

export class APIRouter {
  routes: APIRoutes = {}
  base: string = ''

  use(path: string, router: APIRouter) {
    router.base = path
    const routes = Object.fromEntries(Object.entries(router.routes).map(([k, r]) => [`${path}/${k.replace('/', '')}`.replace(/\/$/, ''), r]))
    this.routes = Object.assign(this.routes, routes)
  }
  get<R extends string, P = RouteParameters<R>, Q = QueryParameters<R>>(path: R, callback: CallbackAPI<P, Q>) {
    this.routes[this.base + path] = Object.assign(this.routes[this.base + path] ?? {}, { GET: callback } as MethodRoute)
  }
  post<R extends string, P = RouteParameters<R>, Q = QueryParameters<R>>(path: R, callback: CallbackAPI<P, Q>) {
    this.routes[this.base + path] = Object.assign(this.routes[this.base + path] ?? {}, { POST: callback } as MethodRoute)
  }
  put<R extends string, P = RouteParameters<R>, Q = QueryParameters<R>>(path: R, callback: CallbackAPI<P, Q>) {
    this.routes[this.base + path] = Object.assign(this.routes[this.base + path] ?? {}, { PUT: callback } as MethodRoute)
  }
  patch<R extends string, P = RouteParameters<R>, Q = QueryParameters<R>>(path: R, callback: CallbackAPI<P, Q>) {
    this.routes[this.base + path] = Object.assign(this.routes[this.base + path] ?? {}, { PATCH: callback } as MethodRoute)
  }
  delete<R extends string, P = RouteParameters<R>, Q = QueryParameters<R>>(path: R, callback: CallbackAPI<P, Q>) {
    this.routes[this.base + path] = Object.assign(this.routes[this.base + path] ?? {}, { DELETE: callback } as MethodRoute)
  }
}