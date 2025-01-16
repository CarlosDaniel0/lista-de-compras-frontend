import { ObjectFromList } from '../../util/types'
import { APIResponse } from '../entities/APIResponse'

export interface ParamsDictionary {
  [key: string]: string
}

export interface QueryDictionary {
  [key: string]: string
}

export interface APIRequest<P = ParamsDictionary, Q = QueryDictionary>
  extends Omit<Request, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  params: P
  query: Q
}

type RemoveTail<
  S extends string,
  Tail extends string
> = S extends `${infer P}${Tail}` ? P : S
type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
  `.${string}`
>

export type RouteParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}:${infer Rest}`
  ? {
      [P in GetRouteParameter<Rest>]: string
    } & (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
      ? RouteParameters<Next>
      : unknown)
  : unknown

type GetRouteQuery<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `=${string}`>, `-${string}`>,
  `.${string}`
>

export type QueryParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}&${infer Rest}` | `${string}?${infer Rest}`
  ? {
      [P in GetRouteQuery<Rest>]: string
    } & (Rest extends `${GetRouteQuery<Rest>}${infer Next}`
      ? QueryParameters<Next>
      : unknown)
  : unknown

export type CallbackAPI<P = ParamsDictionary, Q = QueryDictionary> = (
  request: APIRequest<P, Q>,
  response: APIResponse,
  channel: BroadcastChannel
) => Promise<void>

type Conditions = {
  contains?: string
}

export interface ParamsORM<
  T extends ReadonlyArray<string>,
  O extends ReadonlyArray<string>
> {
  data?: Partial<
    ObjectFromList<T, string | boolean | number | Date | undefined>
  >
  select?: Partial<ObjectFromList<T, boolean>>
  where?: Partial<
    ObjectFromList<T, string | boolean | number | Date | Conditions | undefined>
  >
  include?: Partial<ObjectFromList<O, boolean>>
}

export interface ArrayParamsORM<T extends ReadonlyArray<string>> {
  data?: Partial<
    ObjectFromList<T, string | boolean | number | Date | undefined>
  >[]
  select?: Partial<ObjectFromList<T, boolean>>
  where?: Partial<
    ObjectFromList<T, string | boolean | number | Date | Conditions | undefined>
  >
  // include?: Partial<ObjectFromList<T, boolean>>
}
