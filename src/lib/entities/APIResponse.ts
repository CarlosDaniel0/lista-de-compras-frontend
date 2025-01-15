import { statusCodes } from "../utils/constants"

export class APIResponse {
  response: Response | undefined

  send<T,>(body: T) {
    this.response = APIResponse._send(200)(body)
  }  

  status(code: keyof typeof statusCodes) {
    return APIResponse._send(code) 
  }

  static _send (status: keyof typeof statusCodes) {
    return <T = Record<string, never>|string,>(body: T) => {
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
  }
}