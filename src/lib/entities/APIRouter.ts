import { CallbackAPI, RouteParameters } from "../utils/types"

export type APIRoutes = Record<string, CallbackAPI>

export class APIRouter {
  routes: APIRoutes = {}
  base: string = ''

  use(path: string, router: APIRouter) {
    router.base = path
    this.routes = Object.assign(this.routes, router.base = path)
  }
  get<R extends string, P = RouteParameters<R>>(path: R, callback: CallbackAPI<P>) {
    this.routes[this.base + path] = callback as CallbackAPI
  }
  post<R extends string, P = RouteParameters<R>>(path: R, callback: CallbackAPI<P>) {
    this.routes[this.base + path] = callback as CallbackAPI
  }
  put<R extends string, P = RouteParameters<R>>(path: R, callback: CallbackAPI<P>) {
    this.routes[this.base + path] = callback as CallbackAPI
  }
  patch<R extends string, P = RouteParameters<R>>(path: R, callback: CallbackAPI<P>) {
    this.routes[this.base + path] = callback as CallbackAPI
  }
  delete<R extends string, P = RouteParameters<R>>(path: R, callback: CallbackAPI<P>) {
    this.routes[this.base + path] = callback as CallbackAPI
  }
}