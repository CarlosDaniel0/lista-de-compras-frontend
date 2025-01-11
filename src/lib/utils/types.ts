import { APIResponse } from ".";

export interface ParamsDictionary {
  [key: string]: string;
}

export interface APIRequest<P = ParamsDictionary> extends Request {
  params: P
}

type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
  `.${string}`
>

export type RouteParameters<Route extends string> = string extends Route ? ParamsDictionary
    : Route extends `${string}:${infer Rest}` ?
            & (  { [P in GetRouteParameter<Rest>]: string })
            & (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? RouteParameters<Next> : unknown)
    : unknown;

export type CallbackAPI<P = ParamsDictionary> = (request: APIRequest<P>, response: typeof APIResponse) => void