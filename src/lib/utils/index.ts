import { statusCodes } from "./constants"

const send = (status: keyof typeof statusCodes) => <T = Record<string, never>|string,>(body: T) => {
  const headers: ResponseInit = {
    status,
    statusText: statusCodes[status],
    headers: {
      date: new Date().toString().split('-')[0],
      'Content-Type': 'application/json; charset=utf-8',
      'x-powered-by': 'API-Local',
    },
  }
  return new Response(JSON.stringify(body), headers)
}

export const formatParams = (params: string) => {
  return Object.fromEntries(params.substring(1).split('&').map(item => item.split('=')))
}

export const APIResponse = {
  send: send(200),
  status: send
}